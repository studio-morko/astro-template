// Environment variables
export const Env = {
  PUBLIC_SITE_URL : process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000',
};

// Site configuration
export const site = import.meta.env.PROD
  ? Env.PUBLIC_SITE_URL 
  : 'http://localhost:3000';

// Custom application configuration
export const app = {
  errors: {
    enabled   : true,
    supported : [ 
      400, 401, 403, 
      404, 408, 418, 
      429, 500, 503 ],
    fallback: {
      clientError : 404,
      serverError : 500
    }
  },

  i18n: {
    enabled  : true,
    fallback : 'en',
    locales  : {
      en : { name: 'English', endonym: 'English', direction: 'ltr' },
      fi : { name: 'Finnish', endonym: 'Suomi',   direction: 'ltr' }
    }
  },

  theme: {
    enabled  : true,
    default: 'light',
    options: ['light', 'dark']
  }
};