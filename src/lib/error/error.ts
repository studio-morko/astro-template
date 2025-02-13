import { Locale }            from '@lib/locale/locale';
import { HTTPStatus }        from '@lib/error/error.types';
import { app }               from '@root/astro.config.mjs';
import type { ErrorConfig }       from '@lib/error/error.types';
import type { MiddlewareHandler } from 'astro';

// Private state
let currentStatus = HTTPStatus.NotFound;

// Default patterns to ignore
const DEFAULT_IGNORE_PATTERNS = [
  '/_',
  '.jpg', '.jpeg', '.png', '.gif', '.svg', 
  '.webp', '.avif', '.ico', '.js', '.css'
];

/**
 * Error handling namespace
 */
export const HTTPError = {
  config: {
    supported : app.errors.supported.map(code => code as HTTPStatus),
    fallback  : {
      clientError : app.errors.fallback.clientError as HTTPStatus,
      serverError : app.errors.fallback.serverError as HTTPStatus
    }
  } as ErrorConfig,


  /**
   * Set status with fallback handling
   */
  set(code: number): HTTPStatus {
    if (!Object.values(HTTPStatus).includes(code)) {
      currentStatus = HTTPStatus.NotFound;
      return currentStatus;
    }

    if (this.config.supported.includes(code as HTTPStatus)) {
      currentStatus = code as HTTPStatus;
      return currentStatus;
    }

    currentStatus = code >= 500
      ? this.config.fallback.serverError
      : this.config.fallback.clientError;
    
    return currentStatus;
  },

  /**
   * Get the current status code
   * 
   * @returns {HTTPStatus} : Current status code
   */
  get status(): HTTPStatus {
    return currentStatus;
  },

  /**
   * Get the error title
   * 
   * @returns {string} : Error title
   */
  get title(): string {
    return Locale.t(`error.${currentStatus}.title`);
  },

  /**
   * Get the error description
   * 
   * @returns {string} : Error description
   */
  get description(): string {
    return Locale.t(`error.${currentStatus}.description`);
  },

  /**
   * Get the enabled status
   * 
   * @returns {boolean} : Enabled status
   */
  get enabled(): boolean {
    return app.errors.enabled || false;
  },

  /**
   * Create middleware for error handling
   * 
   * @param ignore                : Array of strings to ignore in pathname
   * @returns {MiddlewareHandler} : Error handling middleware
   */
  middleware(ignore: string[] = DEFAULT_IGNORE_PATTERNS): MiddlewareHandler {

    return async ({ url, request }, next) => {
      // Skip error pages to prevent infinite loops
      if (url.pathname.includes('/error')) {
        return next();
      }

      // Check for status override
      const statusOverride = url.searchParams.get('status');
      if (statusOverride) {
        return this.createPageResponse(url, this.set(Number(statusOverride)));
      }

      // Skip paths matching ignore patterns
      if (ignore.some(pattern => url.pathname.includes(pattern))) {
        return next();
      }

      try {
        const response = await next();
        if (response.status >= 400) {
          return this.createPageResponse(url, this.set(response.status));
        }
        return response;
      } catch (error: unknown) {
        if (error instanceof Response && error.status >= 400) {
          return this.createPageResponse(url, this.set(error.status));
        }
        
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return this.createPageResponse(
          url,
          this.set(HTTPStatus.ServerError),
          errorMessage
        );
      }
    };
  },

   /**
   * Create error response with HTML error page
   */
   async createPageResponse(url: URL, status: number, message?: string): Promise<Response> {
    const urlParts = url.pathname.split('/');
    const locale   = urlParts[1] || Locale.current;
    
    const errorUrl = new URL(`/${locale}/error`, url.origin);
    errorUrl.searchParams.set('status', status.toString());
    errorUrl.searchParams.set('path', url.pathname);
    if (message) errorUrl.searchParams.set('message', message);

    try {
      const errorResponse = await fetch(errorUrl.toString());
      const errorContent  = await errorResponse.text();
      
      return new Response(errorContent, {
        status,
        headers : { 'Content-Type': 'text/html' }
      });
    } catch (error) {
      // Fallback to plain text if error page fails
      return this.createTextResponse(status, message);
    }
  },

  /**
   * Create plain text error response
   */
  createTextResponse(status: number, message?: string): Response {
    return new Response(message || this.description, {
      status,
      headers : { 'Content-Type': 'text/plain' }
    });
  }
}; 

/**
 * Error Handling Flow Explained:
 * 1. User Request: https://mysite.com/blog/article
 *    🌐 Browser Request -> 📟 Server
 * 
 * 2. Middleware URL Check:
 *    📟 Server
 *    └─► 🔍 Check URL "/blog/article"
 *        ❌ Not in ignore list [/_, .jpg, .css, etc]
 *        ✅ Continue to error handling
 * 
 * 3. Success Case:
 *    🎯 Process Request
 *    └─► ✨ Success (200 OK)
 *        └─► 📄 Return content
 * 
 * 4. Error Case - Not Found:
 *    🎯 Process Request
 *    └─► ❌ 404 Not Found
 *        └─► 🔄 Error Handler
 *            ├─► 📝 Set status: 404
 *            └─► 🎨 Return error page
 * 
 * 5. Error Case - Server Error:
 *    🎯 Process Request
 *    └─► 💥 Server Error
 *        └─► 🔄 Error Handler
 *            ├─► 📝 Set status: 500
 *            └─► 🎨 Return error page
 * 
 * 6. Ignored URL Case:
 *    🌐 Request: "/images/photo.jpg"
 *    └─► 🔍 Check URL
 *        ├─► ✅ Contains ".jpg" (in ignore list)
 *        └─► ⏭️ Skip error handling
 *            └─► 📸 Serve directly
 */