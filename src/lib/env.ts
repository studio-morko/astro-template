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