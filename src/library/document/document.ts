import { stat } from 'fs/promises';
import path     from 'path';

/**
 * Document namespace handles public file-related 
 * operations
 */
export const Document = {
  
  /**
   * Gives the unix timestamp of the last modification 
   * time of the document. This is useful for giving files
   * a cache-busting query parameter.
   * 
   * @param filePath : The path to the file
   * @returns        : The unix timestamp of the last modification time
   */
  async modified(filePath: string): Promise<number> {
    if (!filePath) {
      console.warn('No file path provided to created method');
      return 0;
    }
    try {
      const path  = this.path(filePath);
      const stats = await stat(path);
      return Math.floor(stats.mtimeMs / 1000);
    } catch (error) {
      console.error(`Error getting creation time for ${filePath}:`, error);
      return 0;
    }
  },

  /**
   * Constructs the full path to a file in the public directory
   * 
   * @param filePath : The path to the file relative to the public directory
   * @returns        : The full path to the file
   */
  path(filePath: string): string {
    return path.join(process.cwd(), "public", filePath);
  }
};