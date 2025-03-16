/**
 * Service for managing animation set folders
 */

import { saveAs } from 'file-saver';
import { 
  saveFolder, 
  saveFolderFrames, 
  getAllFolders, 
  getFramesForFolder, 
  deleteFolder, 
  isDatabaseInitialized,
  folderToDatabaseFormat,
  folderFrameToDatabaseFormat
} from '../db/indexedDb';

// Interface for a folder structure
export interface AnimationFolder {
  id: string;
  name: string;
  frames: string[];
  createdAt: string;
}

// Local storage key for folders
const FOLDERS_STORAGE_KEY = 'pixelAdventure_animationFolders';

/**
 * Create a new animation folder
 * @param name Folder name
 * @returns The created animation folder
 */
export const createAnimationFolder = async (name: string): Promise<AnimationFolder> => {
  const folder: AnimationFolder = {
    id: Math.random().toString(36).substring(2, 8),
    name,
    frames: [],
    createdAt: new Date().toISOString()
  };
  
  // Save to database if available, otherwise localStorage
  if (isDatabaseInitialized()) {
    const folderData = folderToDatabaseFormat(folder.id, folder.name);
    await saveFolder(folderData);
  } else {
    // Save to local storage as fallback
    saveAnimationFolders([...getAnimationFolders(), folder]);
  }
  
  return folder;
};

/**
 * Add a frame to an animation folder
 * @param folderId ID of the folder
 * @param frameUrl URL of the frame image
 * @returns Updated list of folders
 */
export const addFrameToFolder = async (folderId: string, frameUrl: string): Promise<AnimationFolder[]> => {
  const folders = await getAnimationFolders();
  
  const updatedFolders = folders.map(folder => {
    if (folder.id === folderId) {
      return {
        ...folder,
        frames: [...folder.frames, frameUrl]
      };
    }
    return folder;
  });
  
  // Save to database if available
  if (isDatabaseInitialized()) {
    const folderFrameData = folderFrameToDatabaseFormat(folderId, frameUrl);
    await saveFolderFrames(folderFrameData);
  } else {
    // Save to local storage as fallback
    saveAnimationFolders(updatedFolders);
  }
  
  return updatedFolders;
};

/**
 * Remove a frame from an animation folder
 * @param folderId ID of the folder
 * @param frameIndex Index of the frame to remove
 * @returns Updated list of folders
 */
export const removeFrameFromFolder = (folderId: string, frameIndex: number): AnimationFolder[] => {
  const folders = getAnimationFolders();
  
  const updatedFolders = folders.map(folder => {
    if (folder.id === folderId) {
      const updatedFrames = [...folder.frames];
      updatedFrames.splice(frameIndex, 1);
      
      return {
        ...folder,
        frames: updatedFrames
      };
    }
    return folder;
  });
  
  // Save to local storage
  saveAnimationFolders(updatedFolders);
  
  return updatedFolders;
};

/**
 * Delete an animation folder
 * @param folderId ID of the folder to delete
 * @returns Updated list of folders
 */
export const deleteAnimationFolder = async (folderId: string): Promise<AnimationFolder[]> => {
  const folders = await getAnimationFolders();
  const filteredFolders = folders.filter(folder => folder.id !== folderId);
  
  // Delete from database if available
  if (isDatabaseInitialized()) {
    await deleteFolder(folderId);
  } else {
    // Save to local storage as fallback
    saveAnimationFolders(filteredFolders);
  }
  
  return filteredFolders;
};

/**
 * Rename an animation folder
 * @param folderId ID of the folder
 * @param newName New name for the folder
 * @returns Updated list of folders
 */
export const renameAnimationFolder = (folderId: string, newName: string): AnimationFolder[] => {
  const folders = getAnimationFolders();
  
  const updatedFolders = folders.map(folder => {
    if (folder.id === folderId) {
      return {
        ...folder,
        name: newName
      };
    }
    return folder;
  });
  
  // Save to local storage
  saveAnimationFolders(updatedFolders);
  
  return updatedFolders;
};

/**
 * Get all animation folders
 * @returns Array of animation folders
 */
export const getAnimationFolders = async (): Promise<AnimationFolder[]> => {
  try {
    // Try to get from database first
    if (isDatabaseInitialized()) {
      const dbFolders = await getAllFolders();
      const result: AnimationFolder[] = [];
      
      for (const dbFolder of dbFolders) {
        const frameData = await getFramesForFolder(dbFolder.id);
        
        result.push({
          id: dbFolder.id,
          name: dbFolder.name,
          frames: frameData.map((data: any) => data.frame_data),
          createdAt: dbFolder.created_at
        });
      }
      
      return result;
    } else {
      // Fallback to localStorage
      const foldersData = localStorage.getItem(FOLDERS_STORAGE_KEY);
      return foldersData ? JSON.parse(foldersData) : [];
    }
  } catch (error) {
    console.error('Error loading animation folders:', error);
    return [];
  }
};

/**
 * Save animation folders to local storage or database
 * @param folders Array of animation folders
 */
export const saveAnimationFolders = (folders: AnimationFolder[]): void => {
  try {
    // We still save a simple version to localStorage as a backup
    // but we reduce the data to avoid exceeding quota
    const simpleFolders = folders.map(folder => ({
      ...folder,
      frames: [] // Don't store frames in localStorage
    }));
    
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(simpleFolders));
  } catch (error) {
    console.error('Error saving animation folders:', error);
  }
};

/**
 * Export an animation folder as a zip file
 * @param folderId ID of the folder to export
 */
export const exportFolderAsZip = async (folderId: string): Promise<void> => {
  const folders = getAnimationFolders();
  const folder = folders.find(f => f.id === folderId);
  
  if (!folder) {
    throw new Error('Folder not found');
  }
  
  // In a real implementation, this would create a zip file with all frames
  // For now, we'll simulate it by creating a JSON file
  
  const folderData = {
    name: folder.name,
    frames: folder.frames,
    createdAt: folder.createdAt
  };
  
  const jsonBlob = new Blob([JSON.stringify(folderData, null, 2)], { type: 'application/json' });
  saveAs(jsonBlob, `${folder.name.replace(/\s+/g, '_')}_animation.json`);
};
