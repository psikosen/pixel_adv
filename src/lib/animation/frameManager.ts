/**
 * Frame management utilities for the Pixel Adventure application
 */

import { generatePlaceholderFrames } from './animationUtils';
import { generatePixelArtFrames } from '../api/geminiApi';
import { 
  saveSpriteSet, 
  saveFrame, 
  getAllSpriteSets, 
  getFramesForSpriteSet, 
  isDatabaseInitialized,
  spriteToDatabaseFormat,
  frameToDatabaseFormat
} from '../db/indexedDb';

export interface Frame {
  id: number;
  filename: string;
  src: string;
}

export interface SpriteSet {
  id: string;
  name?: string;
  frames: string[];
  thumbnails: string[];
  metadata?: {
    style: string;
    object: string;
    action: string;
    background: string;
    prompt?: string;
    createdAt: string;
  };
}

/**
 * Generate new frames based on style, object, action, and background
 * @param style Style of the sprite
 * @param object Object/character type
 * @param action Action being performed
 * @param background Background setting
 * @param count Number of frames to generate
 * @returns Promise resolving to an array of Frame objects
 */
export const generateFrames = async (
  style: string,
  object: string,
  action: string,
  background: string,
  count: number = 8,
  customPrompt?: string,
  apiKey?: string
): Promise<Frame[]> => {
  // Use custom prompt if provided, otherwise construct one from the parameters
  const prompt = customPrompt ||
    `Create a ${style} pixel art of a ${object} ${action} ${background}. The image should be a square format with dimensions of 32x32 pixels. Use clear outlines and limited color palette appropriate for pixel art.`;
  
  try {
    if (apiKey) {
      // Use Gemini API to generate frames
      const frameUrls = await generatePixelArtFrames(prompt, count, apiKey);
      
      // Convert to Frame objects
      return frameUrls.map((src, index) => ({
        id: index + 1,
        filename: `${index + 1}.png`,
        src
      }));
    } else {
      // Fallback to placeholder generator if no API key
      return new Promise((resolve) => {
        setTimeout(() => {
          const frames = generatePlaceholderFrames(style, object, action, count);
          resolve(frames);
        }, 1000);
      });
    }
  } catch (error) {
    console.error('Error generating frames:', error);
    throw error;
  }
};

/**
 * Create a new sprite set from frames
 * @param frames Array of Frame objects
 * @param style Style of the sprite
 * @param object Object/character type
 * @param action Action being performed
 * @param background Background setting
 * @returns New SpriteSet object
 */
export const createSpriteSet = (
  frames: Frame[],
  style: string,
  object: string,
  action: string,
  background: string,
  customPrompt?: string
): SpriteSet => {
  // Generate a random ID for the sprite set
  const id = Math.random().toString(36).substring(2, 8);
  
  return {
    id,
    frames: frames.map(frame => frame.src),
    thumbnails: frames.map(frame => frame.src),
    metadata: {
      style,
      object,
      action,
      background,
      prompt: customPrompt,
      createdAt: new Date().toISOString()
    }
  };
};

/**
 * Add a frame to a sprite set
 * @param spriteSet SpriteSet to modify
 * @param frame Frame to add
 * @returns Updated SpriteSet
 */
export const addFrameToSpriteSet = (
  spriteSet: SpriteSet,
  frame: Frame
): SpriteSet => {
  return {
    ...spriteSet,
    frames: [...spriteSet.frames, frame.src],
    thumbnails: [...spriteSet.thumbnails, frame.src]
  };
};

/**
 * Remove a frame from a sprite set
 * @param spriteSet SpriteSet to modify
 * @param index Index of the frame to remove
 * @returns Updated SpriteSet
 */
export const removeFrameFromSpriteSet = (
  spriteSet: SpriteSet,
  index: number
): SpriteSet => {
  const newFrames = [...spriteSet.frames];
  const newThumbnails = [...spriteSet.thumbnails];
  
  newFrames.splice(index, 1);
  newThumbnails.splice(index, 1);
  
  return {
    ...spriteSet,
    frames: newFrames,
    thumbnails: newThumbnails
  };
};

/**
 * Reorder frames in a sprite set
 * @param spriteSet SpriteSet to modify
 * @param fromIndex Original index of the frame
 * @param toIndex New index for the frame
 * @returns Updated SpriteSet
 */
export const reorderFramesInSpriteSet = (
  spriteSet: SpriteSet,
  fromIndex: number,
  toIndex: number
): SpriteSet => {
  if (fromIndex === toIndex) return spriteSet;
  
  const newFrames = [...spriteSet.frames];
  const newThumbnails = [...spriteSet.thumbnails];
  
  // Remove from original position
  const frameToMove = newFrames.splice(fromIndex, 1)[0];
  const thumbnailToMove = newThumbnails.splice(fromIndex, 1)[0];
  
  // Insert at new position
  newFrames.splice(toIndex, 0, frameToMove);
  newThumbnails.splice(toIndex, 0, thumbnailToMove);
  
  return {
    ...spriteSet,
    frames: newFrames,
    thumbnails: newThumbnails
  };
};

/**
 * Save sprite sets to IndexedDB database
 * 
 * IMPORTANT: Frames are stored in the browser's IndexedDB database, not as image files on disk.
 * The actual image data is stored as base64-encoded strings in the database.
 * This is why you won't see separate image files in a directory.
 * 
 * @param spriteSets Array of SpriteSets to save
 */
export const saveSpriteSetsToStorage = async (spriteSets: SpriteSet[]): Promise<void> => {
  try {
    // First try saving to database if initialized
    if (isDatabaseInitialized()) {
      for (const set of spriteSets) {
        // Convert to database format
        const spriteData = spriteToDatabaseFormat(
          set.id, 
          set.name, 
          set.metadata?.style || '', 
          set.metadata?.object || '', 
          set.metadata?.action || '', 
          set.metadata?.background || '', 
          set.metadata?.prompt || ''
        );
        
        // Save sprite data
        await saveSpriteSet(spriteData);
        
        // Save frames
        set.frames.forEach(async (frameSrc, index) => {
          const frameData = frameToDatabaseFormat(
            set.id, 
            index, 
            `frame_${index}.png`, 
            frameSrc
          );
          await saveFrame(frameData);
        });
      }
    } else {
      // Fallback to localStorage with limited data (no full image data)
      // This prevents exceeding localStorage quota
      const limitedSets = spriteSets.map(set => ({
        ...set,
        // Store only IDs or small thumbnails instead of full frame data
        frames: [], // Don't store frames in localStorage
        thumbnails: set.thumbnails.slice(0, 1) // Store only first thumbnail
      }));
      
      localStorage.setItem('pixelAdventure_spriteSets', JSON.stringify(limitedSets));
    }
  } catch (error) {
    console.error('Error saving sprite sets:', error);
  }
};

/**
 * Load sprite sets from local storage or database
 * @returns Array of SpriteSets or null if none found
 */
export const loadSpriteSetsFromStorage = async (): Promise<SpriteSet[] | null> => {
  try {
    // First try loading from database if initialized
    if (isDatabaseInitialized()) {
      const spriteSets = await getAllSpriteSets();
      
      // Convert database format to SpriteSet format
      const result: SpriteSet[] = [];
      
      for (const dbSet of spriteSets) {
        const frames = await getFramesForSpriteSet(dbSet.id);
        // Sort frames by frame_index
        frames.sort((a, b) => a.frame_index - b.frame_index);
        
        result.push({
          id: dbSet.id,
          name: dbSet.name,
          frames: frames.map((frame: any) => frame.image_data),
          thumbnails: frames.map((frame: any) => frame.image_data),
          metadata: {
            style: dbSet.style,
            object: dbSet.object,
            action: dbSet.action,
            background: dbSet.background,
            prompt: dbSet.prompt,
            createdAt: dbSet.created_at
          }
        });
      }
      
      return result;
    } else {
      // Fallback to localStorage
      const data = localStorage.getItem('pixelAdventure_spriteSets');
      if (data) {
        return JSON.parse(data);
      }
    }
  } catch (error) {
    console.error('Error loading sprite sets:', error);
  }
  return null;
};

/**
 * Convert frames to a format suitable for the FrameList component
 * @param spriteSet SpriteSet containing frames
 * @returns Array of Frame objects
 */
export const spriteSetToFrames = (spriteSet: SpriteSet): Frame[] => {
  return spriteSet.frames.map((src, index) => ({
    id: index + 1,
    filename: `${index + 1}.png`,
    src
  }));
};
