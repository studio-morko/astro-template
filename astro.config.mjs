import { defineConfig } from 'astro/config';
import node             from '@astrojs/node';

// Custom application configuration
export const app = {
  errors: {
    enabled   : true,
    supported : [
      400, // Bad Request
      401, // Unauthorized
      403, // Forbidden
      404, // Not Found
      408, // Request Timeout
      418, // I'm a Teapot
      429, // Too Many Requests
      500, // Internal Server Error
      503  // Service Unavailable
    ],
    fallback: {
      clientError : 404,  // Not Found
      serverError : 500   // Internal Server Error
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
};

// Astro configuration
export default defineConfig({
  output  : 'static',
  adapter : node({
    mode : 'standalone',
    port : 3000
  })
});
