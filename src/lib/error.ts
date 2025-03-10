import { Locale }            from '@root/src/lib/locale';
import { app }               from '@root/astro.config.mjs';
import type { MiddlewareHandler } from 'astro';

/**
 * HTTP status codes we handle
 */
export enum HTTPStatus {
  BadRequest                  = 400,
  Unauthorized                = 401,
  PaymentRequired             = 402,
  Forbidden                   = 403,
  NotFound                    = 404,
  MethodNotAllowed            = 405,
  NotAcceptable               = 406,
  ProxyAuthRequired           = 407,
  RequestTimeout              = 408,
  Conflict                    = 409,
  Gone                        = 410,
  LengthRequired              = 411,
  PreconditionFailed          = 412,
  PayloadTooLarge             = 413,
  URITooLong                  = 414,
  UnsupportedMediaType        = 415,
  RangeNotSatisfiable         = 416,
  ExpectationFailed           = 417,
  ImATeapot                   = 418,
  MisdirectedRequest          = 421,
  UnprocessableEntity         = 422,
  Locked                      = 423,
  FailedDependency            = 424,
  TooEarly                    = 425,
  UpgradeRequired             = 426,
  PreconditionRequired        = 428,
  TooManyRequests             = 429,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons  = 451,
  ServerError                 = 500,
  NotImplemented              = 501,
  BadGateway                  = 502,
  ServiceUnavailable          = 503,
  GatewayTimeout              = 504,
  HTTPVersionNotSupported     = 505,
  VariantAlsoNegotiates       = 506,
  InsufficientStorage         = 507,
  LoopDetected                = 508,
  NotExtended                 = 510,
  NetworkAuthRequired         = 511
}

/**
 * Error status type
 */
export type ErrorStatus = HTTPStatus;

/**
 * Error configuration type is used to
 * define all supported errors, and their fallback values
 */
export type ErrorConfig = {
  enabled   : boolean;
  supported : ErrorStatus[];
  fallback  : {
    clientError : ErrorStatus; // Default for 4xx errors (like 400)
    serverError : ErrorStatus; // Default for 5xx errors (like 500)
  }
};

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