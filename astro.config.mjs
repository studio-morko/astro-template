// @ts-check
import { defineConfig } from 'astro/config';

// Custom application configuration
export const app = {
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
export default defineConfig({});
