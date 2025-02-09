import { defineConfig } from 'astro/config';
import node             from '@astrojs/node';
import sitemap          from '@astrojs/sitemap';
import autoprefixer     from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import postcssNesting   from 'postcss-nesting';
import cssnano          from 'cssnano';

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
    postcssPresetEnv({
      features: {
        'custom-properties'    : true,
        'custom-media-queries' : true,
      },
      preserve : true,
      stage    : 0
    }),
    cssnano({
      preset: ['default', {
        discardComments: {
          removeAll : true,
        },
        colormin : false
      }]
    })
  ]
};

// Astro configuration
export default defineConfig({
  output  : 'static',
  site    : 'https://example.com',
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
});
