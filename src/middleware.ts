import { defineMiddleware, sequence } from 'astro:middleware';
import { Locale }                     from '@lib/locale/locale';
import { HTTPError }                  from '@lib/error/error';
import { Metadata }                   from '@lib/metadata/metadata';

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

  // 3. Reset metadata, to ensure it doesn't 
  //    persist between requests
  defineMiddleware(Metadata.middleware()),

];

/**
 * Middleware sequence
 */
export const onRequest = sequence(...middlewares);
