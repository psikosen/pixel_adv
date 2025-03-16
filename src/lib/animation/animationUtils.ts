/**
 * Animation utility functions for the Pixel Adventure application
 */

import GIF from 'gif.js';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';

/**
 * Calculate frames per second based on speed value
 * @param speed Speed value (1-10)
 * @returns Calculated FPS
 */
export const calculateFps = (speed: number): number => {
  // Map speed (1-10) to FPS (1-24)
  return Math.max(1, Math.min(24, speed * 2.4));
};

/**
 * Generate a unique ID for sprite sets
 * @returns Unique ID string
 */
export const generateSpriteSetId = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

/**
 * Create an animated GIF from frame images
 * @param frames Array of image URLs or data URLs
 * @param fps Frames per second
 * @returns Promise resolving to a Blob containing the GIF
 */
export const createGif = async (frames: string[], fps: number): Promise<Blob> => {
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
      
      if (images.length === 0) {
        reject(new Error('No frames provided'));
        return;
      }
      
      // Get dimensions from the first image
      const width = images[0].width;
      const height = images[0].height;
      
      // Create a GIF
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: '/gif.worker.js'
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
          gif.addFrame(canvas, { delay: 1000 / fps });
        }
      });
      
      // Render the GIF
      gif.on('finished', (blob: Blob | PromiseLike<Blob>) => {
        resolve(blob);
      });
      
      gif.render();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Create a sprite sheet from frame images
 * @param frames Array of image URLs or data URLs
 * @param columns Number of columns in the sprite sheet
 * @returns Promise resolving to a data URL of the sprite sheet
 */
export const createSpriteSheet = async (
  frames: string[],
  columns: number = 4
): Promise<string> => {
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
      
      if (images.length === 0) {
        reject(new Error('No frames provided'));
        return;
      }
      
      // Get dimensions from the first image
      const frameWidth = images[0].width;
      const frameHeight = images[0].height;
      
      // Calculate rows needed
      const rows = Math.ceil(images.length / columns);
      
      // Create a canvas for the sprite sheet
      const canvas = document.createElement('canvas');
      canvas.width = frameWidth * Math.min(columns, images.length);
      canvas.height = frameHeight * rows;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw each frame onto the sprite sheet
      images.forEach((img, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        ctx.drawImage(img, col * frameWidth, row * frameHeight);
      });
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export animation as GIF
 * @param frames Array of image URLs or data URLs
 * @param fps Frames per second
 * @param filename Filename for the downloaded GIF
 */
export const exportGif = async (
  frames: string[],
  fps: number,
  filename: string = 'animation.gif'
): Promise<void> => {
  try {
    const gifBlob = await createGif(frames, fps);
    saveAs(gifBlob, filename);
  } catch (error) {
    console.error('Error exporting GIF:', error);
    throw error;
  }
};

/**
 * Export animation as sprite sheet
 * @param frames Array of image URLs or data URLs
 * @param columns Number of columns in the sprite sheet
 * @param filename Filename for the downloaded sprite sheet
 */
export const exportSpriteSheet = async (
  frames: string[],
  columns: number = 4,
  filename: string = 'spritesheet.png'
): Promise<void> => {
  try {
    const dataUrl = await createSpriteSheet(frames, columns);
    
    // Convert data URL to Blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting sprite sheet:', error);
    throw error;
  }
};

/**
 * Capture a screenshot of an element
 * @param element HTML element to capture
 * @returns Promise resolving to a data URL of the screenshot
 */
export const captureElementScreenshot = async (
  element: HTMLElement
): Promise<string> => {
  try {
    return await toPng(element);
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
};

/**
 * Generate placeholder frames for demonstration purposes
 * @param style Style of the sprite
 * @param object Object/character type
 * @param action Action being performed
 * @param count Number of frames to generate
 * @returns Array of frame objects
 */
export const generatePlaceholderFrames = (
  style: string,
  object: string,
  action: string,
  count: number = 8
) => {
  // In a real app, this would call an API or use AI to generate frames
  // For now, we'll just return placeholder data
  
  // Use different colors for different objects
  const colorMap: Record<string, string> = {
    'goblin': '#8BC34A',
    'knight': '#3F51B5',
    'mage': '#9C27B0',
    'archer': '#FF9800'
  };
  
  const baseColor = colorMap[object] || '#2196F3';
  
  return Array.from({ length: count }, (_, index) => {
    // Create a canvas to generate a placeholder image
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 32, 32);
      
      // Draw a simple sprite based on the frame number
      ctx.fillStyle = baseColor;
      
      // Different animation based on action
      if (action === 'walking' || action === 'running') {
        // Walking/running animation - move position based on frame
        const offsetX = (index % 4) * 2;
        ctx.fillRect(8 + offsetX, 8, 16, 16);
        
        // Legs
        ctx.fillRect(12 + offsetX, 24, 2, 8);
        ctx.fillRect(18 + offsetX, 24, 2, 8);
      } else if (action === 'attacking') {
        // Attacking animation - extend arm based on frame
        const armExtension = Math.min(8, (index % 4) * 3);
        ctx.fillRect(8, 8, 16, 16);
        ctx.fillRect(24, 12, armExtension, 2);
      } else if (action === 'dancing') {
        // Dancing animation - rotate position
        const angle = (index / count) * Math.PI * 2;
        const offsetX = Math.cos(angle) * 4;
        const offsetY = Math.sin(angle) * 4;
        ctx.fillRect(8 + offsetX, 8 + offsetY, 16, 16);
      } else {
        // Default idle animation - simple breathing effect
        const size = 16 + Math.sin(index / 2) * 2;
        const offset = (16 - size) / 2;
        ctx.fillRect(8 + offset, 8 + offset, size, size);
      }
      
      // Add style-specific details
      if (style === '8-bit') {
        // Add pixelated border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, 16, 16);
      } else if (style === '16-bit') {
        // Add some shading
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(16, 8, 8, 16);
      } else if (style === 'pixel-art') {
        // Add pixel details
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(10, 10, 2, 2);
      }
    }
    
    return {
      id: index + 1,
      filename: `${index + 1}.png`,
      src: canvas.toDataURL('image/png')
    };
  });
};
