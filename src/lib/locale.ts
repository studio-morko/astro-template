import { app }        from '@root/astro.config.mjs';
import { HTTPError }  from '@lib/error';
import { HTTPStatus } from '@lib/error';
import type { MiddlewareHandler } from 'astro';

/**
 * Locale configuration, used to configure the custom locale
 * configuration in the app configuration file.
 */
export type LocaleConfig = {
  enabled  : boolean
  fallback : string
  locales  : LocaleSource
}
  
/**
 * Locale structure defining a language's properties
 */
export type LocaleStructure = {
  name      : string // Language name in English
  endonym   : string // Language name in its own language
  direction : string // Text direction (ltr/rtl)
}
  
/**
 * Translation structure
 */
export type TranslationStructure = {
  [key: string] : string
}

/**
 * The source of the locales, can be either a
 * direct object of locales or a function that
 * fetches the locales.
 */
export type LocaleSource = 
  | LocaleStructure[]
  | (() => Promise<LocaleStructure[]>)
  

// Private state
const folder       = 'locales';
const translations = new Map<string, TranslationStructure>();
const config       = app.i18n;
let   current      = config.fallback;

/**
 * Locale namespace for handling internationalization
 */
export const Locale = {

  /**
   * Get locale info by code
   * @param   {string} code     : Locale code to get info for
   * @returns {LocaleStructure} : The locale info
   */
  info(code: string): LocaleStructure {
    return config.locales[code as keyof typeof config.locales];
  },

  /**
   * Load translations for a locale
   * @param   {string} code : Locale code to load translations for
   * @returns {Promise<void>}
   */
  async loadTranslations(code: string): Promise<void> {
    if (translations.has(code)) return;
    
    try {
      /* @vite-ignore */
      const module = await import(`../${folder}/${code}.ts`);
      translations.set(code, module.default);
    } catch (error) {
      console.error(`Failed to load translations for locale: ${code}`, error);
      translations.set(code, {}); // Set empty to prevent repeated load attempts
      throw error;
    }
  },

  /**
   * Set locale cookie
   * @param   {string} code    : Locale code to set in cookie
   * @param   {any}    cookies : Astro cookies API instance
   * @returns {void}
   */
  setCookie(code: string, cookies: any): void {
    if (cookies?.set) {
      cookies.set('locale', code, { 
      path   : '/',
      maxAge : 60 * 60 * 24 * 365 // 1 year
    });
    }
  },

  /**
   * Set current locale
   * @param   {string} code    : Locale code to set
   * @param   {any}    cookies : Optional Astro cookies API instance
   * @returns {Promise<void>}
   */
  async set(code: string, cookies?: any): Promise<void> {
    try {
      await this.loadTranslations(code);
    } catch (error) {
      console.error(`Setting locale ${code} without translations due to error`);
    }
    current = code;
    if (cookies) {
      this.setCookie(code, cookies);
    }
  },

  /**
   * Get locale from cookie
   * @param   {any} cookies        : Astro cookies API instance
   * @returns {string | undefined} : The locale from cookie if it exists
   */
  fromCookie(cookies: any): string | undefined {
    return cookies?.get('locale')?.value;
  },

  /**
   * Get current locale
   * @returns {string} : The current locale
   */
  get current(): string {
    return current;
  },

  /**
   * Get list of supported locales
   * @returns {string[]} : The list of supported locales
   */
  get supported(): string[] {
    return Object.keys(config.locales);
  },

  /**
   * Get fallback locale
   * @returns {string} : The fallback locale
   */
  get fallback(): string {
    return config.fallback;
  },

  /**
   * Is locale handling enabled
   * @returns {boolean} : Whether locale handling is enabled
   */
  get enabled(): boolean {
    return config.enabled;
  },
  
  /**
   * Translate a key
   * @param   {string} key : Key to translate
   * @returns {string}     : The translated key
   */
  t(key: string): string {
    const localeTranslations = translations.get(current) || {};
    return localeTranslations[key] ?? key;
  },

  /**
   * Middleware for handling locale detection and setting
   * 
   * 1. Check if the path starts with a locale code
   * 2. If not, redirect to the appropriate locale
   * 3. If yes, set the locale and redirect to the appropriate locale
   * 
   * @returns {MiddlewareHandler} Astro middleware handler
   */
  middleware(): MiddlewareHandler {
    return async ({ cookies, request, url }, next) => {
      const urlParts     = url.pathname.split('/').filter(Boolean);
      const firstSegment = urlParts[0];

      // If path doesn't start with a locale code, redirect to appropriate locale
      if (!firstSegment || !this.supported.includes(firstSegment)) {
        let locale = this.fallback;

        // Try cookie first
        const cookieLocale = this.fromCookie(cookies);
        if (cookieLocale && this.supported.includes(cookieLocale)) {
          locale = cookieLocale;
        } 
        // Try browser language
        else if (request.headers.get('accept-language')) {
          const browserLang = request.headers.get('accept-language')?.split(',')[0].split('-')[0];
          if (browserLang && this.supported.includes(browserLang)) {
            locale = browserLang;
            this.setCookie(locale, cookies);
          }
        }

        return Response.redirect(`${url.origin}/${locale}${url.pathname}`, 302);
      }

      // Set the locale if we're on a locale path
      try {
        await this.set(firstSegment, cookies);
      } catch (error) {
        console.error(`Failed to load translations for locale: ${firstSegment}`, error);
        return HTTPError.createTextResponse(HTTPStatus.ServerError, `Failed to load translations for locale: ${firstSegment}`);
      }
      
      return next();
    };
  },

  /**
   * Adds current locale prefix to a path
   * 
   * @param   {string}  path  : Path to add locale prefix to
   * @param   {boolean} force : Force replace existing locale prefix
   * @returns {string}        : Path with current locale prefix
   */
  url(path: string, force: boolean = false): string {
    if (path === '' || path === '/') {
      return `/${this.current}`;
    }

    const segments = path.split('/').filter(Boolean);
    const hasLocalePrefix = this.supported.includes(segments[0]);

    // If path has a locale prefix and force is true, remove it
    if (hasLocalePrefix && force) {
      path = '/' + segments.slice(1).join('/');
    }

    // If path already has correct locale prefix, return as is
    if (hasLocalePrefix && segments[0] === this.current) {
      return path;
    }

    return `/${this.current}/${path.replace(/^\//, '')}`;
  }
};