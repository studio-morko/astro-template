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
  name      : string // Language name in English
  endonym   : string // Language name in its own language
  direction : string // Text direction (ltr/rtl)
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
  