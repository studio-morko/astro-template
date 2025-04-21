export const Generator = {

  /**
   * Generate a unique ID
   * @param prefix - The prefix of the ID
   * @returns The ID
   */
  id(prefix: string) {
    return `${this.slug(prefix)}-${Math.random().toString(36).substring(2, 15)}`;
  },

  /**
   * Generate a slug from a text
   * @param text - The text to generate a slug from
   * @returns The slug
   */
  slug(text: string) {
    return text
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}