import      { Env }               from '@lib/env';
import type { MiddlewareHandler } from 'astro';

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
  type?        : Type;     // Type of the page
};

export type Type = "website" | "article" | "profile" | 
                   "video"   | "music"   | "image";

// The template for the metadata
const template = Env.has("PUBLIC_NAME") 
  ? `%s | ${Env.get("PUBLIC_NAME")}` : '%s'; 

// Initial/default metadata values
const defaultMetadata: MetadataStructure = {
  index       : false,             // Whether the page should be indexed by search engines
  follow      : false,             // Whether the page should be followed by search engines
  absolute    : false,             // Whether the metadata is absolute
  template    : template,          // The template for the metadata
  title       : "Missing title!",  // The title of the page
  description : undefined,         // The description of the page
  keywords    : undefined,         // The keywords of the page
  image       : undefined,         // The image of the page
  type        : undefined,         // The type of the page
};

// Current metadata state
let metadata: MetadataStructure = { ...defaultMetadata };


export const Metadata = {

  /**
   * Get the index value
   * @returns {boolean} : The index value
   */
  get index(): boolean {
    return metadata.index;
  },

  /**
   * Get the follow value
   * @returns {boolean} : The follow value
   */
  get follow(): boolean {
    return metadata.follow;
  },

  /**
   * Get the absolute value
   * @returns {boolean} : The absolute value
   */
  get absolute(): boolean {
    return metadata.absolute;
  },

  /**
   * Get the template value
   * @returns {string} : The template value
   */
  get template(): string {
    return metadata.template;
  },

  /**
   * Get the formatted title value using the template
   * @returns {string} : The formatted title value
   */
  get title(): string {
    if (metadata.title && metadata.template.includes('%s')) {
      return metadata.template.replace('%s', metadata.title);
    }
    return metadata.title;
  },

  /**
   * Get the description value
   * @returns {string | undefined} : The description value
   */
  get description(): string | undefined {
    return metadata.description;
  },

  /**
   * Get the keywords value
   * @returns {string[] | undefined} : The keywords value
   */
  get keywords(): string[] | undefined {
    return metadata.keywords;
  },

  /**
   * Get the image value
   * @returns {string | undefined} : The image value
   */
  get image(): string | undefined {
    return metadata.image;
  },

  /**
   * Get the type value
   * @returns {string | undefined} : The type value
   */
  get type(): string | undefined {
    return metadata.type;
  },

  /**
   * Get metadata by a key, otherwise return whole metadata object
   * @param   {keyof MetadataStructure} [key]                                  : Optional key to get specific metadata
   * @returns {MetadataStructure | MetadataStructure[keyof MetadataStructure]} : The metadata value or whole object
   */
  get(key?: keyof MetadataStructure): MetadataStructure | MetadataStructure[keyof MetadataStructure] {
    if (key) {
      return metadata[key];
    }
    return { ...metadata };  // Return a copy of the full metadata object
  },

  /**
   * Update metadata values unless metadata is frozen
   * @param values      : Partial metadata values to update
   * @returns {boolean} : Whether the update was applied
   */
  set(values: Partial<MetadataStructure>): boolean {

    // If metadata is frozen, don't update it
    if (Object.isFrozen(metadata)) { 
      return false;
    }

    metadata = { ...metadata, ...values };

    // If the absolute value is true, freeze the metadata
    if (values.absolute) {
      Object.freeze(metadata);
    }

    return true;
  },

  /**
   * Reset metadata to default values
   */
  reset(): void {
    metadata = { ...defaultMetadata };
  },

  /**
   * Create middleware for metadata reset
   * @returns {MiddlewareHandler} Metadata reset middleware
   */
  middleware(): MiddlewareHandler {
    return async (_, next) => {
      this.reset();
      return next();
    };
  }
}
