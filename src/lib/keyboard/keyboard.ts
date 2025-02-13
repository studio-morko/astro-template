import { Key } from '@lib/keyboard/keyboard.types';

/**
 * Keyboard handling namespace
 */
export const Keyboard = {
  _pressed     : new Set<string>(),
  _debug       : false,
  _initialized : false,

  /**
   * Enable/disable debug mode
   */
  set debug(value: boolean) {
    this._debug = value;
  },

  /**
   * Get debug mode status
   */
  get debug(): boolean {
    return this._debug;
  },

  /**
   * Initialize keyboard event listeners
   */
  _init(): void {
    if (this._initialized) return;
    
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this._pressed.add(e.key);
      if (this._debug) {
        console.log('Key Down:', e.key);
        console.log('Currently Pressed:', [...this._pressed]);
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this._pressed.delete(e.key);
      if (this._debug) {
        console.log('Key Up:', e.key);
        console.log('Currently Pressed:', [...this._pressed]);
      }
    });

    window.addEventListener('blur', () => {
      if (this._debug && this._pressed.size > 0) {
        console.log('Window Blur - Clearing Keys:', [...this._pressed]);
      }
      this._pressed.clear();
    });

    this._initialized = true;
  },

  /**
   * Check if a key is currently pressed
   * @param   {Key} key : Key to check
   * @returns {boolean} : Whether the key is pressed
   */
  on(key: Key): boolean {
    this._init();
    return this._pressed.has(key);
  },

  /**
   * Check if all specified keys are currently pressed
   * @param   {Key[]} keys : Keys to check
   * @returns {boolean}    : Whether all keys are pressed
   */
  all(...keys: Key[]): boolean {
    this._init();
    return keys.every(key => this.on(key));
  },

  /**
   * Check if any of the specified keys are currently pressed
   * @param   {Key[]} keys : Keys to check
   * @returns {boolean}    : Whether any key is pressed
   */
  any(...keys: Key[]): boolean {
    this._init();
    return keys.some(key => this.on(key));
  }
};
