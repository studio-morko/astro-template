/**
 * Metadata structure
 */
export type MetadataStructure = {
  index        : boolean;  // Wheter to index the page
  follow       : boolean;  // Wheter to follow the links on the page
  absolute     : boolean;  // Wheter to ignore the template
  template     : string;   // Template to use for the page %s
  title        : string;   // Title of the page
  description? : string;   // Description of the page
  keywords?    : string[]; // Keywords of the page
  image?       : string;   // Image of the page
  url?         : string;   // URL of the page
  type?        : string;   // Type of the page
};