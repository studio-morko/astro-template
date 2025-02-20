import { Key } from '@lib/keyboard/keyboard.types';

/**
 * Keyboard handling namespace
 */
export const Keyboard = {
  pressed: new Set<string>(),
  initialized: false,

  /**
   * Initialize keyboard event listeners
   */
  init(): void {
    if (this.initialized) return;
    
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.pressed.add(e.key);
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.pressed.delete(e.key);
    });

    window.addEventListener('blur', () => {
      this.pressed.clear();
    });

    this.initialized = true;
  },

  /**
   * Check if a key is currently pressed
   * @param   {Key} key : Key to check
   * @returns {boolean} : Whether the key is pressed
   */
  on(key: Key): boolean {
    this.init();
    return this.pressed.has(key);
  },

  /**
   * Check if all specified keys are currently pressed
   * @param   {Key[]} keys : Keys to check
   * @returns {boolean}    : Whether all keys are pressed
   */
  all(...keys: Key[]): boolean {
    this.init();
    return keys.every(key => this.on(key));
  },

  /**
   * Check if any of the specified keys are currently pressed
   * @param   {Key[]} keys : Keys to check
   * @returns {boolean}    : Whether any key is pressed
   */
  any(...keys: Key[]): boolean {
    this.init();
    return keys.some(key => this.on(key));
  }
};
