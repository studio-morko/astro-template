import { app }                    from '@root/app.config';
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
  code      : string
  name      : string
  endonym   : string
  direction : string
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
const translations = new Map<string, TranslationStructure>();
const config       = app.i18n;
let   current      = config.fallback;

/**
 * Locale namespace for handling internationalization
 */
export const Locale = {
  
  /**
   * Get locale(s) information
   * @param   {string} [code] : Optional locale code to get info for
   * @returns {LocaleStructure[]} : Array of locale info, filtered by code if provided
   */
  get(code?: string): LocaleStructure[] {
    // Get all locales with their codes
    const locales = Object.entries(config.locales).map(([code, locale]) => ({
      code,
      ...locale
    }));
    
    // If a specific code is provided, filter to just that locale
    if (code) {
      return locales.filter(locale => locale.code === code);
    }
    
    // Otherwise return all locales
    return locales;
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
   * Load translations for a locale asynchronously
   * @param   {string} code : Locale code to load translations for
   * @returns {Promise<void>}
   */
  async loadLocaleTranslations(code: string): Promise<void> {
    if (translations.has(code)) return;
    
    try {
      /* @vite-ignore */
      const module = await import(`../../assets/translations/${code}.ts`);
      translations.set(code, module.default);
    } catch (error) {
      console.error(`Failed to load translations for locale: ${code}`, error);
      translations.set(code, {}); // Set empty to prevent repeated load attempts
      throw error;
    }
  },

  /**
   * Translate a key
   * @param   {string} key : The key to translate
   * @returns {string}     : The translated string
   */
  t(key: string): string {
    const localeTranslations = translations.get(this.current) || {};
    return localeTranslations[key] ?? key;
  },

  /**
   * Set current locale
   * @param   {string} code   : The locale code to set
   * @param   {any}    cookies : Optional Astro cookies API instance
   * @returns {Promise<void>}
   */
  async set(code: string, cookies?: any): Promise<void> {
    if (!this.supported.includes(code)) {
      console.warn(`Locale ${code} is not supported`);
      return;
    }
    current = code;
    if (cookies?.set) {
      cookies.set('locale', code, { 
        path   : '/',
        maxAge : 60 * 60 * 24 * 365
      });
    }
    await this.loadLocaleTranslations(code);
  },

  /**
   * Adds current locale prefix to a path
   * @param   {string} path : The path to add the locale prefix to
   * @returns {string}      : The new path with the locale prefix
   */
  url(path: string): string {
    if(!this.enabled) return path;
    
    // Handle root path
    if (path === '' || path === '/') {
      return `/${this.current}`;
    }

    // Remove leading/trailing slashes and split
    const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    
    // If path already has a locale prefix, return as is
    if (this.supported.includes(segments[0])) {
      return `/${segments.join('/')}`;
    }

    // Add current locale prefix
    return `/${this.current}/${segments.join('/')}`;
  },

  /**
   * Changes the locale in the current URL
   * @param   {string} code : The locale code to change to
   * @param   {string} path : The path to change the locale in
   * @returns {string}      : The new URL with the locale prefix
   */
  change(code: string, path: string): string {
    if (!this.supported.includes(code)) {
      console.warn(`Locale ${code} is not supported`);
    }

    // Remove leading/trailing slashes and split
    const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    
    // Get base path without locale prefix
    const basePath = this.supported.includes(segments[0]) 
      ? segments.slice(1).join('/')
      : segments.join('/');

    return `/${code}/${basePath}/`;
  },

  /**
   * Middleware for handling locale detection and setting
   * @returns {MiddlewareHandler} : The middleware handler
   */
  middleware(): MiddlewareHandler {
    return ({ cookies, request, url }, next) => {
      // Skip Astro's internal routes
      if (url.pathname.startsWith('/_')) return next();

      // Quick check for locale prefix
      const path         = url.pathname.replace(/^\/+|\/+$/g, '');
      const segments     = path.split('/');
      const firstSegment = segments[0];

      // If we have a valid locale prefix, use it
      if (firstSegment && this.supported.includes(firstSegment)) {
        this.set(firstSegment, cookies);
        return next();
      }

      // Otherwise, determine locale and redirect
      let locale = this.fallback;
      const cookieLocale = cookies?.get('locale')?.value;
      
      if (cookieLocale && this.supported.includes(cookieLocale)) {
        locale = cookieLocale;
      } 
      else if (request.headers.get('accept-language')) {
        const browserLang = request.headers.get('accept-language')?.split(',')[0].split('-')[0];
        if (browserLang && this.supported.includes(browserLang)) {
          locale = browserLang;
          cookies?.set('locale', locale, { 
            path   : '/',
            maxAge : 60 * 60 * 24 * 365
          });
        }
      }

      // Redirect to locale-prefixed path
      const targetPath = path ? `/${locale}/${path}` : `/${locale}/`;
      return Response.redirect(`${url.origin}${targetPath}`, 302);
    };
  }
};