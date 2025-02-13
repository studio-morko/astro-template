import { stat } from 'fs/promises';
import path     from 'path';
import { statSync } from 'fs';

/**
 * Document namespace handles public file-related 
 * operations
 */
export const Document = {
  
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
      const cleanPath = webPath.startsWith('/') ? webPath.slice(1) : webPath;
      const fullPath  = this.path(cleanPath);
      const stats     = statSync(fullPath);                                   // Use sync version
      return Math.floor(stats.mtimeMs / 1000);
    } catch (error) {
      console.error(`Error getting modification time for ${webPath}:`, error);
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