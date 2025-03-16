"use client";
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SpriteManager from '../components/sprites/SpriteManager';
import AnimationPreview from '../components/animation/AnimationPreview';
import FrameManager from '../components/sprites/FrameManager';
import ControlPanel from '../components/ui/ControlPanel';
import AnimationControls from '../components/animation/AnimationControls';
import Feedback from '../components/ui/Feedback';
import SpecialModeDialog from '../components/ui/SpecialModeDialog';
import { initDatabase, isDatabaseInitialized } from '../lib/db/indexedDb';
import { 
  SpriteSet, 
  Frame, 
  generateFrames, 
  createSpriteSet, 
  spriteSetToFrames,
  loadSpriteSetsFromStorage,
  saveSpriteSetsToStorage
} from '../lib/animation/frameManager';
import { 
  AnimationFolder,
  createAnimationFolder,
  addFrameToFolder, 
  getAnimationFolders,
  exportFolderAsZip
} from '../lib/api/folderService';

// Placeholder sprite data for initial UI
const placeholderSpriteSets: SpriteSet[] = [
 
];

export default function Home() {
  // State for sprite sets and active selection
  const [spriteSets, setSpriteSets] = useState<SpriteSet[]>(placeholderSpriteSets);
  const [activeSpriteSetId, setActiveSpriteSetId] = useState<string | null>('093abc');
  
  // State for frames and animation
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  
  // State for control panel
  const [style, setStyle] = useState('8-bit');
  const [object, setObject] = useState('goblin');
  const [action, setAction] = useState('dancing');
  const [background, setBackground] = useState('in the battlefield');
  const [framesGenerated, setFramesGenerated] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [folders, setFolders] = useState<AnimationFolder[]>([]);
  const [animationType, setAnimationType] = useState<string>('loop');
  const [easing, setEasing] = useState<string>('linear');
  const [totalFrames, setTotalFrames] = useState(8);
  
  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [error, setError] = useState<string | null>(null);
  
  // State for Special Mode
  // Special Mode is a powerful feature that allows users to split sprite sheets into individual frames
  // It's activated via a glowing button in the advanced settings panel
  const [specialModeActive, setSpecialModeActive] = useState(false);
  const [specialModeDialogOpen, setSpecialModeDialogOpen] = useState(false);

  // Initialize database on component mount
  useEffect(() => {
    const loadDatabaseAndData = async () => {
      try {
        // Only initialize if not already initialized
        if (!isDatabaseInitialized()) {
          setLoading(true);
          setLoadingMessage('Initializing database...');
          await initDatabase();
          setLoading(false);
        }
        
        // Load data
        loadInitialData();
      } catch (error) {
        console.error('Error initializing database:', error);
        setError(`Failed to initialize database: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setLoading(false);
      }
    };
    
    loadDatabaseAndData();
  }, []);
  
  // Load sprite sets and folders from storage
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Loading saved data...');
      
      const storedSpriteSets = await loadSpriteSetsFromStorage();
      if (storedSpriteSets && storedSpriteSets.length > 0) {
        setSpriteSets(storedSpriteSets);
        setActiveSpriteSetId(storedSpriteSets[0].id);
      }
      
      // Load API key from local storage if available
      const savedApiKey = localStorage.getItem('pixelAdventure_apiKey');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      
      // Load animation folders
      const folders = await getAnimationFolders();
      setFolders(folders);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Failed to load saved data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };
  
  // Save API key to local storage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('pixelAdventure_apiKey', apiKey);
    }
  }, [apiKey]);

  // Update frames when active sprite set changes
  useEffect(() => {
    if (activeSpriteSetId) {
      const activeSet = spriteSets.find(set => set.id === activeSpriteSetId);
      if (activeSet) {
        setFrames(spriteSetToFrames(activeSet));
        
        // Update control panel values from metadata
        if (activeSet.metadata) {
          setStyle(activeSet.metadata.style);
          setObject(activeSet.metadata.object);
          setAction(activeSet.metadata.action);
          setBackground(activeSet.metadata.background);
        }
      }
    } else {
      setFrames([]);
    }
    
    // Reset current frame index
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  }, [activeSpriteSetId, spriteSets]);

  // Handler functions for sprite sets
  const handleSelectSpriteSet = (id: string) => {
    setActiveSpriteSetId(id);
  };

  const handleDeleteSpriteSet = (id: string) => {
    const newSpriteSets = spriteSets.filter(set => set.id !== id);
    setSpriteSets(newSpriteSets);
    
    if (activeSpriteSetId === id) {
      setActiveSpriteSetId(newSpriteSets.length > 0 ? newSpriteSets[0].id : null);
    }
  };

  const handleCreateSpriteSet = () => {
    // Create a new empty sprite set
    const newSet: SpriteSet = {
      id: Math.random().toString(36).substring(2, 8),
      frames: [],
      thumbnails: [],
      metadata: {
        style,
        object,
        action,
        background,
        createdAt: new Date().toISOString()
      }
    };
    
    setSpriteSets([...spriteSets, newSet]);
    setActiveSpriteSetId(newSet.id);
  };

  // Handler functions for frames
  const handleSelectFrame = (index: number) => {
    setCurrentFrameIndex(index);
    setIsPlaying(false);
  };

  const handleMoveFrame = (index: number, direction: 'up' | 'down') => {
    const newFrames = [...frames];
    
    if (direction === 'up' && index > 0) {
      [newFrames[index], newFrames[index - 1]] = [newFrames[index - 1], newFrames[index]];
    } else if (direction === 'down' && index < frames.length - 1) {
      [newFrames[index], newFrames[index + 1]] = [newFrames[index + 1], newFrames[index]];
    }
    
    setFrames(newFrames);
    
    // Update the active sprite set
    if (activeSpriteSetId) {
      const updatedSpriteSets = spriteSets.map(set => {
        if (set.id === activeSpriteSetId) {
          return {
            ...set,
            frames: newFrames.map(frame => frame.src),
            thumbnails: newFrames.map(frame => frame.src)
          };
        }
        return set;
      });
      
      setSpriteSets(updatedSpriteSets);
    }
  };

  const handleDeleteFrame = (index: number) => {
    const newFrames = frames.filter((_, i) => i !== index);
    setFrames(newFrames);
    
    if (currentFrameIndex >= newFrames.length) {
      setCurrentFrameIndex(Math.max(0, newFrames.length - 1));
    }
    
    // Update the active sprite set
    if (activeSpriteSetId) {
      const updatedSpriteSets = spriteSets.map(set => {
        if (set.id === activeSpriteSetId) {
          return {
            ...set,
            frames: newFrames.map(frame => frame.src),
            thumbnails: newFrames.map(frame => frame.src)
          };
        }
        return set;
      });
      
      setSpriteSets(updatedSpriteSets);
    }
  };

  const handleAddFrame = () => {
    // In a real app, this would open a dialog to import or create a new frame
    // For now, we'll just add a placeholder frame
    const newFrame: Frame = {
      id: frames.length + 1,
      filename: `${frames.length + 1}.png`,
      src: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAAsUlEQVRYCWP8DwQMAwiYBtBusNWjDhgNgQEPARZ8ueDAgQMMBw8exKeEoJy9vT2Dg4MDTnV4HQCyHOQIZAOOPlyK0zB0iXsX3jGA1J9hUYVLldhshbNBDLwOACkAWV5fXw9igkHPkVMwJkF617zbBNUMeBoYdcBoCIyGwGgIjIbAaAgQrA1B1TEyOPqQcA0HUw+qjpUMhGBcrDQjvn4BPRokeB2A1clUFhxNhKMhMBoCANr9NVRkDEQTAAAAAElFTkSuQmCC`
    };
    
    const newFrames = [...frames, newFrame];
    setFrames(newFrames);
    
    // Update the active sprite set
    if (activeSpriteSetId) {
      const updatedSpriteSets = spriteSets.map(set => {
        if (set.id === activeSpriteSetId) {
          return {
            ...set,
            frames: newFrames.map(frame => frame.src),
            thumbnails: newFrames.map(frame => frame.src)
          };
        }
        return set;
      });
      
      setSpriteSets(updatedSpriteSets);
    }
  };

  // Handler functions for animation controls
  const handlePlayPauseToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (newSpeed: number) => {
    console.log('Speed changed to:', newSpeed);
    setSpeed(newSpeed);
  };

  // Handler function for Special Mode
  const handleSpecialModeToggle = () => {
    if (specialModeActive) {
      // Turn off special mode
      setSpecialModeActive(false);
    } else {
      // Turn on special mode and open dialog
      setSpecialModeActive(true);
      setSpecialModeDialogOpen(true);
    }
  };

  /**
   * Handler function for importing frames from Special Mode
   * @param importedFrames Frames imported from the Special Mode dialog
   * 
   * Note: Frames are stored in the IndexedDB database, not as separate image files on disk.
   * This is why you won't see them as separate files in a directory.
   */
  const handleImportFrames = (importedFrames: Frame[]) => {
    if (importedFrames.length === 0) return;
    
    // Create a new sprite set with the imported frames
    const newSet: SpriteSet = {
      id: Math.random().toString(36).substring(2, 8),
      frames: importedFrames.map(frame => frame.src),
      thumbnails: importedFrames.map(frame => frame.src),
      metadata: {
        style: 'imported',
        object: 'custom',
        action: 'animation',
        background: 'custom',
        prompt: 'Imported from Special Mode',
        createdAt: new Date().toISOString()
      }
    };
    
    const updatedSpriteSets = [...spriteSets, newSet];
    setSpriteSets(updatedSpriteSets);
    setActiveSpriteSetId(newSet.id);
    setFrames(importedFrames);
    
    // Save to storage
    saveSpriteSetsToStorage(updatedSpriteSets);
  };

  // Handler function for generating frames
  const handleGenerate = async () => {
    // Clear any previous errors
    setError(null);
    
    // Loading state is managed by framesGenerated
    setFramesGenerated(0);
    setLoading(true);
    setLoadingMessage('Generating frames...');
    
    try {
      if (!apiKey) {
        throw new Error('API key is required to generate images');
      }
      
      // Generate new frames using the prompt or parameters
      const generatedFrames = await generateFrames(
        style, 
        object, 
        action, 
        background, 
        totalFrames,
        customPrompt,
        apiKey
      );
      
      // Update progress as frames are generated
      for (let i = 0; i < generatedFrames.length; i++) {
        setFramesGenerated(i + 1);
        setLoadingMessage(`Processing frame ${i + 1} of ${generatedFrames.length}...`);
        // Simulate delay for visualization
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Create a new sprite set with the generated frames
      const newSet = createSpriteSet(generatedFrames, style, object, action, background, customPrompt);
      
      const updatedSpriteSets = [...spriteSets, newSet];
      setSpriteSets(updatedSpriteSets);
      setActiveSpriteSetId(newSet.id);
      setFrames(generatedFrames);
      
      // Save to storage
      await saveSpriteSetsToStorage(updatedSpriteSets);
      
      // Create a new folder for the animation set
      const folderName = customPrompt 
        ? customPrompt.substring(0, 20) + '...' 
        : `${style} ${object} ${action}`;
      
      const newFolder = await createAnimationFolder(folderName);
      
      // Add frames to the folder
      const frameUrls = generatedFrames.map(frame => frame.src);
      await addFrameToFolder(newFolder.id, frameUrls.join('|'));
      
      // Update folders state
      const updatedFolders = await getAnimationFolders();
      setFolders(updatedFolders);
      setLoading(false);
    } catch (error) {
      console.error('Error generating frames:', error);
      setError(`Failed to generate frames: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Get frame sources for animation preview
  const frameSources = frames.map(frame => frame.src);

  return (
    <MainLayout>
      {/* Left Sidebar - Sprite Sets */}
      <div className="h-full overflow-hidden">
        <SpriteManager
          spriteSets={spriteSets}
          activeSpriteSetId={activeSpriteSetId}
          onSelectSpriteSet={handleSelectSpriteSet}
          onDeleteSpriteSet={handleDeleteSpriteSet}
          onCreateSpriteSet={handleCreateSpriteSet}
        />
      </div>
      
      {/* Center - Control Panel and Animation Preview */}
      <div className="flex flex-col h-full">
        <ControlPanel
          style={style}
          onStyleChange={setStyle}
          object={object}
          onObjectChange={setObject}
          action={action}
          onActionChange={setAction}
          background={background}
          onBackgroundChange={setBackground}
          framesGenerated={framesGenerated}
          totalFrames={totalFrames}
          onTotalFramesChange={setTotalFrames}
          onGenerate={handleGenerate}
          prompt={customPrompt}
          onPromptChange={setCustomPrompt}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onRegenerate={handleGenerate}
          animationType={animationType}
          onAnimationTypeChange={setAnimationType}
          easing={easing}
          onEasingChange={setEasing}
          onSpecialModeToggle={handleSpecialModeToggle}
          specialModeActive={specialModeActive}
        />
        
        <div className="panel flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="animation-preview w-full max-w-md aspect-square">
              {frameSources.length > 0 ? (
                <AnimationPreview
                  frames={frameSources}
                  speed={speed}
                  isPlaying={isPlaying}
                  currentFrameIndex={currentFrameIndex}
                  onFrameChange={setCurrentFrameIndex}
                  animationType={animationType as 'loop' | 'bounce' | 'once' | 'reverse'}
                  easing={easing as 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No frames to display
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <AnimationControls
              isPlaying={isPlaying}
              onPlayPauseToggle={handlePlayPauseToggle}
              speed={speed}
              onSpeedChange={handleSpeedChange}
              currentFrame={currentFrameIndex}
              totalFrames={frameSources.length}
            />
          </div>
        </div>
      </div>
      
      {/* Right Sidebar - Frames */}
      <div className="h-full overflow-hidden">
        <FrameManager
          frames={frames}
          activeFrameIndex={currentFrameIndex}
          onSelectFrame={handleSelectFrame}
          onMoveFrame={handleMoveFrame}
          onDeleteFrame={handleDeleteFrame}
          onAddFrame={handleAddFrame}
          animationSpeed={speed}
        />
      </div>
      
      {/* Loading and Error Feedback */}
      <Feedback
        isLoading={loading}
        loadingMessage={loadingMessage}
        error={error}
        onDismissError={() => setError(null)}
      />
      
      {/* Special Mode Dialog */}
      <SpecialModeDialog
        isOpen={specialModeDialogOpen}
        onClose={() => setSpecialModeDialogOpen(false)}
        onImportFrames={handleImportFrames}
        apiKey={apiKey}
      />
    </MainLayout>
  );
}
