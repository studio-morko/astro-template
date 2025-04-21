/**
 * Environment variable type
 */
export type EnvVariable = string | undefined;

/**
 * Environment variable handling namespace
 */
export const Env = {
  /**
   * Gets the environment variable value for the given key
   * @param   {string} key : The key of the environment variable
   * @returns {string}     : The value of the environment variable
   */
  get(key: string): EnvVariable {
    // Handle special cases for environment mode
    if (key === 'NODE_ENV') {
      return import.meta.env.PROD ? 'production' : 'development';
    }
    const value = import.meta.env[key];
    if (value === undefined) {
      throw new Error(`Environment variable not found: ${key}`);
    }
    return value;
  },

  /**
   * Checks if the environment variable exists
   * @param   {string}  key : The key of the environment variable
   * @returns {boolean}     : True if the environment variable exists
   */
  has(key: string): boolean {
    if (key === 'NODE_ENV') {
      return true; // NODE_ENV is always available via PROD/DEV
    }
    return key in import.meta.env;
  },

  /**
   * Checks if the environment variable equals the given value
   * @param   {string}  key   : The key of the environment variable
   * @param   {string}  value : The value to compare with
   * @returns {boolean}       : True if values match
   */
  is(key: string, value: string): boolean {
    return this.get(key) === value;
  }
};