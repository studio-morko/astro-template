import { defineConfig } from 'astro/config';
import node             from '@astrojs/node';
import sitemap          from '@astrojs/sitemap';
import autoprefixer     from 'autoprefixer';
import postcssNesting   from 'postcss-nesting';
import cssnano          from 'cssnano';

// Environment variables
const Env = {
  NODE_ENV        : process.env.NODE_ENV        ?? 'local',
  PUBLIC_SITE_URL : process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000',
};

// Site configuration
const site = Env.NODE_ENV === 'production'
  ? Env.PUBLIC_SITE_URL : 'http://localhost:3000';

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
};

// Sitemap configuration
export const sitemap = {
  i18n: {
    defaultLocale : app.i18n.fallback,
    locales       : Object.fromEntries(
      Object.keys(app.i18n.locales).map(code => [code, code])
    )
  },
  changefreq : 'weekly',
  priority   : 0.7,
};

// PostCSS configuration
export const postcss = {
  plugins: [
    autoprefixer(),
    postcssNesting(),
    cssnano({
      preset: ['default', {
        discardComments: {
          removeAll : true,
        },
        colormin : false
      }]
    }),
  ]
};


// Astro configuration
export default defineConfig({
  site    : site,
  output  : 'static',
  adapter : node({
    mode : 'standalone',
  }),
  server: {
    port : 3000,
    host : true
  },
  vite: {
    css: {
      postcss : postcss
    }
  },
  integrations: [
    sitemap(sitemap)
  ],
  experimental: {
    svg: true,
  }
});
