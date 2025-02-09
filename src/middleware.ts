import { defineMiddleware, sequence } from 'astro:middleware';
import { Locale }                     from '@library/locale/locale';
import { HTTPError }                  from '@library/error/error';

/**
 * Middleware array
 */
const middlewares = [

  // 1. Use custom locale handler, if enabled
  ...(Locale.enabled ? [
    defineMiddleware(Locale.middleware())
  ] : []),
  
  // 2. Error handling middleware, if enabled
  ...(HTTPError.enabled ? [
    defineMiddleware(HTTPError.middleware())
  ] : []),
];

/**
 * Middleware sequence
 */
export const onRequest = sequence(...middlewares);
