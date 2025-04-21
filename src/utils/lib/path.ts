import path from "path";

export const Path = {
  
  /**
   * Cleans the file path by removing the leading slash
   * 
   * @param filePath : The path to the file relative to the public directory
   * @returns        : The cleaned path
   */
  clean(filePath: string): string {
    return filePath.startsWith('/') ? filePath.slice(1) : filePath;
  },

  /**
   * Constructs the full path to a file in the public directory
   * 
   * @param filePath : The path to the file relative to the public directory
   * @returns        : The full path to the file
   */
  public(filePath: string): string {
    return path.join(process.cwd(), "public", filePath);
  },
};