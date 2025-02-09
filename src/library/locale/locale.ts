import { app }        from '@root/astro.config.mjs';
import { HTTPError }  from '@library/error/error';
import { HTTPStatus } from '@library/error/error.types';
import type { MiddlewareHandler }                     from 'astro';
import type { TranslationStructure, LocaleStructure } from '@library/locale/locale.types';

// Private state
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
      const module = await import(`../../translations/${code}.ts`);
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
  }
};

/**
 * Locale Handling Flow Explained:
 * 1. User Request: https://mysite.com/blog
 *    🌐 Browser Request -> 📟 Server
 * 
 * 2. Middleware Locale Check:
 *    📟 Server
 *    └─► 🔍 Check URL "/blog"
 *        ❌ No locale prefix
 *        └─► 🌍 Detect Locale:
 *            1️⃣ Check Cookie
 *            2️⃣ Check Browser Language
 *            3️⃣ Use Fallback
 *            └─► 🔄 Redirect: /en/blog
 * 
 * 3. Locale Path Case:
 *    🌐 Request: "/en/blog"
 *    └─► 🔍 Check URL
 *        ✅ Has locale prefix "en"
 *        └─► 📝 Set Active Locale
 *            ├─► 🔄 Load Translations
 *            └─► 🍪 Set Cookie
 * 
 * 4. Invalid Locale Case:
 *    🌐 Request: "/xx/blog"
 *    └─► 🔍 Check URL
 *        ❌ Invalid locale "xx"
 *        └─► 🔄 Redirect to fallback
 *            └─► 🌍 /en/blog
 * 
 * 5. Translation Loading:
 *    📝 Set Locale "fi"
 *    └─► 📚 Load Translations
 *        ├─► ✅ Success: Use Finnish
 *        └─► ❌ Error: Use Empty {}
 */