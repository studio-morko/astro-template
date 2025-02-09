import { defineMiddleware, sequence } from 'astro:middleware';
import { Locale }                     from '@library/locale/locale';

/**
 * Middleware array
 */
const middlewares = [

  // 1. Use custom locale handler, if enabled
  ...(Locale.enabled ? [defineMiddleware(Locale.middleware())] : []),
];

/**
 * Middleware sequence:
 */
export const onRequest = sequence(...middlewares);
