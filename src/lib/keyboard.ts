/**
 * Enum for keyboard keys
 */
export enum Key {
  // Modifier Keys
  Alt        = 'Alt',
  Control    = 'Control',
  Shift      = 'Shift',
  Command    = 'Meta',

  // Navigation
  ArrowDown  = 'ArrowDown',
  ArrowLeft  = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowUp    = 'ArrowUp',
  Home       = 'Home',
  End        = 'End',

  // Common UI Keys
  Escape     = 'Escape',
  Enter      = 'Enter',
  Tab        = 'Tab',
  Space      = ' ',
  Backspace  = 'Backspace',
  Delete     = 'Delete',

  // Letters
  A = 'a', B = 'b', C = 'c', D = 'd', 
  E = 'e', F = 'f', G = 'g', H = 'h', 
  I = 'i', J = 'j', K = 'k', L = 'l', 
  M = 'm', N = 'n', O = 'o', P = 'p', 
  Q = 'q', R = 'r', S = 's', T = 't', 
  U = 'u', V = 'v', W = 'w', X = 'x', 
  Y = 'y', Z = 'z',

  // Numbers
  Zero  = '0', One   = '1',
  Two   = '2', Three = '3',
  Four  = '4', Five  = '5',
  Six   = '6', Seven = '7',
  Eight = '8', Nine  = '9'
}

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
