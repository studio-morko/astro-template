import path     from 'path';
import { existsSync, statSync } from 'fs';
import { Path } from '@lib/path';

/**
 * Static file namespace handles public file-related 
 * operations
 */
export const File = {
  
  /**
   * Gets file's last modification time as unix timestamp
   * 
   * @param webPath : Web path to the file (e.g. /assets/image.png)
   * @returns       : Unix timestamp or 0 if error
   */
  modified(webPath: string): number {
    if (!webPath) {
      console.warn('No path provided to modified method');
      return 0;
    }
    try {
      // Remove leading slash for proper path resolution
      const cleanPath = Path.clean(webPath);
      const fullPath  = Path.public(cleanPath);
      const stats     = statSync(fullPath);
      return Math.floor(stats.mtimeMs / 1000);
    } catch (error) {
      console.error(`Error getting modification time for ${webPath}:`, error);
      return 0;
    }
  },

  exists(webPath: string): boolean {
    const fullPath = Path.public(Path.clean(webPath));
    return existsSync(fullPath);
  },

  /**
   * Gets the file's size in bytes
   * 
   * @param webPath : Web path to the file (e.g. /assets/image.png)
   * @returns       : File size in bytes or 0 if error
   */
  size(webPath: string): number {
    const fullPath = Path.public(Path.clean(webPath));
    const stats    = statSync(fullPath);
    return stats.size;
  },
};