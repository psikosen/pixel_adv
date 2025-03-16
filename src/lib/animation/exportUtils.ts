/**
 * Export utilities for the Pixel Adventure application
 */

import { saveAs } from 'file-saver';
import GIF from 'gif.js';
import { SpriteSet } from './frameManager';

export interface GifExportOptions {
  filename: string;
  fps: number;
  loop: boolean;
}

export interface SpriteSheetExportOptions {
  filename: string;
  columns: number;
  padding: number;
  includeMetadata: boolean;
}

/**
 * Export animation as GIF with custom options
 * @param frames Array of image URLs or data URLs
 * @param options GIF export options
 * @returns Promise resolving when export is complete
 */
export const exportGifWithOptions = async (
  frames: string[],
  options: GifExportOptions
): Promise<void> => {
  if (frames.length === 0) {
    throw new Error('No frames to export');
  }

  return new Promise(async (resolve, reject) => {
    try {
      // Load all images first
      const images: HTMLImageElement[] = await Promise.all(
        frames.map(
          (src) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            })
        )
      );

      // Get dimensions from the first image
      const width = images[0].width;
      const height = images[0].height;

      // Create a GIF
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: '/gif.worker.js',
        repeat: options.loop ? 0 : -1 // 0 = loop forever, -1 = no repeat
      });

      // Add frames to the GIF
      images.forEach((img) => {
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          gif.addFrame(canvas, { delay: 1000 / options.fps });
        }
      });

      // Render the GIF
      gif.on('finished', (blob: any) => {
        saveAs(blob, options.filename);
        resolve();
      });

      gif.render();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export sprite sheet with custom options
 * @param frames Array of image URLs or data URLs
 * @param options Sprite sheet export options
 * @returns Promise resolving when export is complete
 */
export const exportSpriteSheetWithOptions = async (
  frames: string[],
  options: SpriteSheetExportOptions,
  spriteSet?: SpriteSet
): Promise<void> => {
  if (frames.length === 0) {
    throw new Error('No frames to export');
  }

  return new Promise(async (resolve, reject) => {
    try {
      // Load all images first
      const images: HTMLImageElement[] = await Promise.all(
        frames.map(
          (src) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            })
        )
      );

      // Get dimensions from the first image
      const frameWidth = images[0].width;
      const frameHeight = images[0].height;

      // Calculate rows needed
      const columns = options.columns;
      const rows = Math.ceil(images.length / columns);

      // Create a canvas for the sprite sheet
      const canvas = document.createElement('canvas');
      canvas.width = (frameWidth + options.padding) * Math.min(columns, images.length) - options.padding;
      canvas.height = (frameHeight + options.padding) * rows - options.padding;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw each frame onto the sprite sheet
      images.forEach((img, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        ctx.drawImage(
          img, 
          col * (frameWidth + options.padding), 
          row * (frameHeight + options.padding)
        );
      });

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Convert data URL to Blob
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      saveAs(blob, options.filename);

      // Create metadata file if requested
      if (options.includeMetadata && spriteSet) {
        const metadata = {
          spriteSheet: options.filename,
          frames: images.length,
          frameWidth,
          frameHeight,
          columns,
          rows,
          padding: options.padding,
          spriteSet: {
            id: spriteSet.id,
            metadata: spriteSet.metadata
          },
          frameData: Array.from({ length: images.length }, (_, i) => ({
            index: i,
            row: Math.floor(i / columns),
            column: i % columns,
            x: (i % columns) * (frameWidth + options.padding),
            y: Math.floor(i / columns) * (frameHeight + options.padding),
            width: frameWidth,
            height: frameHeight
          }))
        };

        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        const metadataFilename = options.filename.replace(/\.[^/.]+$/, '') + '.json';
        saveAs(metadataBlob, metadataFilename);
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export project data for saving
 * @param spriteSets Array of SpriteSets to export
 * @param filename Filename for the exported project
 */
export const exportProject = (spriteSets: SpriteSet[], filename: string = 'pixel_adventure_project.json'): void => {
  try {
    const projectData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      spriteSets
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting project:', error);
    throw error;
  }
};

/**
 * Import project data from file
 * @param file JSON file containing project data
 * @returns Promise resolving to imported project data
 */
export const importProject = (file: File): Promise<{ spriteSets: SpriteSet[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (event.target?.result) {
          const projectData = JSON.parse(event.target.result as string);
          
          if (!projectData.spriteSets || !Array.isArray(projectData.spriteSets)) {
            reject(new Error('Invalid project file format'));
            return;
          }
          
          resolve({ spriteSets: projectData.spriteSets });
        } else {
          reject(new Error('Failed to read file'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
