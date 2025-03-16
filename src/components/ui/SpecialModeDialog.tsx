/**
 * Special Mode Dialog Component
 * 
 * This component provides a powerful frame-splitting tool that allows users to:
 * 1. Upload or provide a URL to a sprite sheet image
 * 2. Split the image into individual animation frames
 * 3. Choose the number of frames and orientation (horizontal or vertical)
 * 4. Preview and import the frames into the main application
 */

import React, { useState, useRef, useEffect } from 'react';
import { Frame } from '../../lib/animation/frameManager';
import { generatePixelArtImage } from '../../lib/api/geminiApi';

interface SpecialModeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFrames: (frames: Frame[]) => void;
  apiKey?: string;
}

const SpecialModeDialog = ({
  isOpen,
  onClose,
  onImportFrames,
  apiKey = ''
}: SpecialModeDialogProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [frameCount, setFrameCount] = useState(4);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical' | 'grid'>('grid');
  const [generatedFrames, setGeneratedFrames] = useState<Frame[]>([]);
  const [step, setStep] = useState<'input' | 'preview' | 'adjust'>('input');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [animationFrames, setAnimationFrames] = useState(8);
  const [action, setAction] = useState('none');
  const [direction, setDirection] = useState('none');
  const [viewType, setViewType] = useState('none');
  const [colorCount, setColorCount] = useState(8);
  const [localApiKey, setLocalApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash-exp');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [gridSize, setGridSize] = useState(32);
  const [gridLines, setGridLines] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  // Tracking for which line is being dragged (x or y) and which index
  const [isDragging, setIsDragging] = useState<{ axis: 'x' | 'y'; index: number } | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('input');
      setImageUrl('');
      setGeneratedFrames([]);
      setError(null);
      setGridLines({ x: [], y: [] });
      setGridSize(32);
      setImageSize({ width: 0, height: 0 });
      setAction('none');
      setDirection('none');
      setViewType('none');
    } else {
      // Set local API key from props when dialog opens
      setLocalApiKey(apiKey || '');
    }
  }, [isOpen, apiKey]);

  // Initialize grid lines when image is loaded and adjust step is entered
  useEffect(() => {
    if (step === 'adjust' && imageUrl && previewCanvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Calculate image size to fit in the canvas
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        
        // Set canvas size to match image aspect ratio but fit within the container
        const maxWidth = 500;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = maxHeight;
          width = width * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        setImageSize({ width, height });
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Draw the image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Calculate grid lines based on orientation and frameCount
        const newGridLines: { x: number[]; y: number[] } = { x: [], y: [] };
        
        if (orientation === 'horizontal' || orientation === 'grid') {
          // For horizontal orientation or grid, divide width into equal parts
          const frameWidth = width / frameCount;
          for (let i = 1; i < frameCount; i++) {
            newGridLines.x.push(i * frameWidth);
          }
        }
        
        if (orientation === 'vertical' || orientation === 'grid') {
          // For vertical orientation or grid, divide height into equal parts
          const frameHeight = height / frameCount;
          for (let i = 1; i < frameCount; i++) {
            newGridLines.y.push(i * frameHeight);
          }
        }
        
        // Set grid lines
        setGridLines(newGridLines);
        
        // Draw grid lines
        drawGridLines();
      };
      
      img.src = imageUrl;
    }
  }, [step, imageUrl, frameCount, orientation, gridSize]);

  // Function to draw grid lines on the preview canvas
  const drawGridLines = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Redraw the image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = '#00BFFF'; // Bright blue
      ctx.lineWidth = 2;
      
      // Draw vertical grid lines (X-axis)
      gridLines.x.forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
        // Draw drag handle
        ctx.fillStyle = '#00BFFF';
        ctx.beginPath();
        ctx.arc(x, canvas.height / 2, 8, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw horizontal grid lines (Y-axis)
      gridLines.y.forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
        // Draw drag handle
        ctx.fillStyle = '#00BFFF';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, y, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    img.src = imageUrl;
  };

  // Start dragging a grid line
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if we're clicking near a grid line
    // First check vertical grid lines (X-axis)
    for (let i = 0; i < gridLines.x.length; i++) {
      if (Math.abs(x - gridLines.x[i]) < 10) {
        setIsDragging({ axis: 'x', index: i });
        setStartPos({ x, y });
        return;
      }
    }
    
    // Then check horizontal grid lines (Y-axis)
    for (let i = 0; i < gridLines.y.length; i++) {
      if (Math.abs(y - gridLines.y[i]) < 10) {
        setIsDragging({ axis: 'y', index: i });
        setStartPos({ x, y });
        return;
      }
    }
  };

  // Drag a grid line
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newGridLines = { ...gridLines };
    
    if (isDragging.axis === 'x') {
      // Update vertical grid line position (X-axis)
      newGridLines.x[isDragging.index] = x;
      
      // Sort grid lines to maintain order
      newGridLines.x.sort((a, b) => a - b);
    } else {
      // Update horizontal grid line position (Y-axis)
      newGridLines.y[isDragging.index] = y;
      
      // Sort grid lines to maintain order
      newGridLines.y.sort((a, b) => a - b);
    }
    
    setGridLines(newGridLines);
    drawGridLines();
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Handle grid size change
  const handleGridSizeChange = (size: number) => {
    setGridSize(size);
  };

  // Handle next step - proceed to adjust step after image load
  const handleProceedToAdjust = () => {
    if (imageUrl) {
      setStep('adjust');
    }
  };

  // Function to generate an image from a prompt using Gemini API
  const handleGenerateFromPrompt = async () => {
    setLoading(true);
    setLoadingMessage('Generating image from prompt...');
    setError(null);
    
    try {
      if (!customPrompt.trim()) {
        throw new Error('Please provide a prompt');
      }
      
      if (!localApiKey) {
        throw new Error('API key is required to generate images. Please add your API key in the advanced settings.');
      }
      
      // Build the action part of the prompt
      let actionText = '';
      if (action !== 'none') {
        actionText = ` ${action}`;
      }

      // Build the direction part of the prompt
      let directionText = '';
      if (direction !== 'none') {
        directionText = ` facing ${direction}`;
      }

      // Build the view type part of the prompt
      let viewTypeText = '';
      if (viewType !== 'none') {
        viewTypeText = ` in ${viewType} style`;
      }
      
      // Create a pixel art specific prompt incorporating all the options
      const enhancedPrompt = `Generate a ${gridSize}x${gridSize} pixel sprite of a ${customPrompt}${actionText}${directionText}${viewTypeText}. The animation consists of ${animationFrames} frames, each showing a natural movement cycle while maintaining a consistent pixel grid and limited color palette of ${colorCount} colors. Ensure the character's proportions, shading, and perspective remain the same, only adjusting limb positions. Avoid AI artifacts, blurring, or misplaced pixels.`;
      
      // Generate the image
      const generatedImageUrl = await generatePixelArtImage(enhancedPrompt, localApiKey, model);
      
      // Set the image URL
      setImageUrl(generatedImageUrl);
      setLoading(false);
      
      // Move to adjust step with the generated image
      setStep('adjust');
    } catch (error) {
      console.error('Error generating image:', error);
      setError(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Use FileReader to read the file as DataURL
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImageUrl(result);
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading image:', error);
        setError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handlePasteUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  /**
   * Splits the input image into individual frames based on user settings and grid lines
   * Uses HTML Canvas to extract portions of the original image
   * Converts each frame to a data URL and creates Frame objects
   */
  const handleSplitImage = async () => {
    setLoading(true);
    setLoadingMessage('Processing image...');
    setError(null);
    
    try {
      if (!imageUrl) {
        throw new Error('Please provide an image URL or upload an image');
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          setLoading(false);
          setError('Canvas not available');
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setLoading(false);
          setError('Canvas context not available');
          return;
        }
 
        const frames: Frame[] = [];
         
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        // Calculate how the grid lines in preview canvas map to original image
        const scaleX = originalWidth / imageSize.width;
        const scaleY = originalHeight / imageSize.height;
        
        // Convert grid lines to original image scale
        const scaledGridLinesX = gridLines.x.map(line => line * scaleX);
        const scaledGridLinesY = gridLines.y.map(line => line * scaleY);
         
        const allXCuts = [0, ...scaledGridLinesX, originalWidth];
        const allYCuts = [0, ...scaledGridLinesY, originalHeight];
        
        // Create frames for each cell in the grid
        let frameIndex = 0;
        
        // For grid mode, create frames for each cell
        if (orientation === 'grid') {
          for (let yIndex = 0; yIndex < allYCuts.length - 1; yIndex++) {
            for (let xIndex = 0; xIndex < allXCuts.length - 1; xIndex++) {
              // Calculate frame dimensions
              const startX = allXCuts[xIndex];
              const endX = allXCuts[xIndex + 1];
              const startY = allYCuts[yIndex];
              const endY = allYCuts[yIndex + 1];
              
              const frameWidth = endX - startX;
              const frameHeight = endY - startY;
              
              // Set canvas size to match the frame
              canvas.width = frameWidth;
              canvas.height = frameHeight;
              
              // Clear canvas
              ctx.clearRect(0, 0, canvas.width, canvas.height);
               
              ctx.drawImage(
                img,
                startX, startY,
                frameWidth, frameHeight,
                0, 0,
                frameWidth, frameHeight
              );
              
              // Convert canvas to data URL
              const dataUrl = canvas.toDataURL('image/png');
              
              // Create frame object
              frames.push({
                id: frameIndex + 1,
                filename: `frame_${frameIndex + 1}.png`,
                src: dataUrl
              });
              
              frameIndex++;
            }
          }
        } else if (orientation === 'horizontal') {
          // Create frames for horizontal slices
          for (let i = 0; i < allXCuts.length - 1; i++) {
            const startX = allXCuts[i];
            const endX = allXCuts[i + 1];
            const frameWidth = endX - startX;
            const frameHeight = originalHeight;
             
            canvas.width = frameWidth;
            canvas.height = frameHeight;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw the specific portion of the image
            ctx.drawImage(
              img,
              startX, 0,
              frameWidth, frameHeight,
              0, 0,
              frameWidth, frameHeight
            );
             
            const dataUrl = canvas.toDataURL('image/png');
            
            // Create frame object
            frames.push({
              id: i + 1,
              filename: `frame_${i + 1}.png`,
              src: dataUrl
            });
          }
        } else {
          // Create frames for vertical slices
          for (let i = 0; i < allYCuts.length - 1; i++) {
            const startY = allYCuts[i];
            const endY = allYCuts[i + 1];
            const frameWidth = originalWidth;
            const frameHeight = endY - startY;
            
            // Set canvas size to match the frame
            canvas.width = frameWidth;
            canvas.height = frameHeight;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw the specific portion of the image
            ctx.drawImage(
              img,
              0, startY,
              frameWidth, frameHeight,
              0, 0,
              frameWidth, frameHeight
            );
            
            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL('image/png');
            
            // Create frame object
            frames.push({
              id: i + 1,
              filename: `frame_${i + 1}.png`,
              src: dataUrl
            });
          }
        }
        
        setGeneratedFrames(frames);
        setStep('preview');
        setLoading(false);
      };
      
      img.onerror = () => {
        setLoading(false);
        setError('Failed to load image. Make sure the URL is accessible or try uploading a file.');
      };
      
      img.src = imageUrl;
    } catch (error) {
      setLoading(false);
      setError(`Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Imports the processed frames into the main application
   * Calls the parent component's callback with the frames
   * Closes the dialog after successful import
   */
  const handleImport = () => {
    onImportFrames(generatedFrames);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-blue-100 dark:bg-blue-800 rounded-lg shadow-xl p-6 w-full max-w-2xl text-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Special Mode - Split Frames</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {loading && (
          <div className="mb-4 p-4 bg-blue-200 text-blue-800 rounded flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {loadingMessage}
          </div>
        )}
        
        {step === 'input' && (
          <div>
            <div className="mb-4">
              <p className="text-gray-800 dark:text-white mb-2">
                Upload a spritesheet or image containing multiple frames, and split it into individual animation frames.
              </p>
            </div>
            
            {/* API Key and Model Selection */}
            <div className="mb-4 grid grid-cols-2 gap-4">
               
              
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Model</label>
                <select
                  className="w-full p-2 border rounded text-black"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="gemini-2.0-flash-thinking-exp-01-21">gemini-2.0-flash-thinking-exp</option>
                  <option value="learnlm-1.5-pro-experimental">learnlm-1.5-pro-experimental</option>
                  <option value="gemini-2.0-pro-exp-02-05">gemini-2.0-pro-exp</option>
                  <option value="gemini-embedding-exp-03-07">gemini-embedding-exp</option>
                </select>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Custom Prompt (Optional)</label>
            <div className="text-xs text-gray-800 dark:text-white mb-2">
                Enter (e.g., Cat, Rabbit, Knight) 
              </div>
            <input
              type="text"
              className="w-full p-2 border rounded text-black"
              placeholder="Enter a simple character, e.g. Cat"
              value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Animation Frames</label>
                <div className="text-xs text-gray-800 dark:text-white mb-2">
                  Number of animation frames to generate (1-24)
                </div>
                <input
                  type="number"
                  className="w-full p-2 border rounded text-black"
                  min="1"
                  max="24"
                  value={animationFrames}
                  onChange={(e) => setAnimationFrames(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Image URL</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-black"
                placeholder="Paste image URL here"
                value={imageUrl}
                onChange={handlePasteUrl}
              />
              <div className="mt-2 text-sm text-gray-800 dark:text-white">Or</div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button 
                className="btn btn-secondary w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </button>
              {imageUrl && imageUrl.startsWith('data:') && (
                <div className="mt-2 text-sm text-green-600">File uploaded</div>
              )}
            </div>
            
            {imageUrl && (
              <div className="mb-6">
                <div className="bg-white p-2 border rounded">
                  <div className="h-48 flex items-center justify-center">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-h-44 max-w-full object-contain"
                    />
                  </div>
                </div>
                <div className="text-xs text-center mt-1 text-gray-800 dark:text-white">
                  Image loaded - click "Adjust Image" to continue
                </div>
              </div>
            )}
            
            {/* Action and Direction */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Action</label>
                <select
                  className="w-full p-2 border rounded text-black"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <option value="none">None (exclude)</option>
                  <option value="idle">Idle</option>
                  <option value="running">Running</option>
                  <option value="walking">Walking</option>
                  <option value="attacking">Attacking</option>
                  <option value="sitting">Sitting</option>
                  <option value="jumping">Jumping</option>
                  <option value="dying">Dying</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Direction</label>
                <select
                  className="w-full p-2 border rounded text-black"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                >
                  <option value="none">None (exclude)</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="up">Up</option>
                  <option value="down">Down</option>
                  <option value="diagonal">Diagonal</option>
                </select>
              </div>
            </div>
            
            {/* View Type and Color Count */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">View Type</label>
                <select
                  className="w-full p-2 border rounded text-black"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                >
                  <option value="none">None (exclude)</option>
                  <option value="side-scroller">Side Scroller</option>
                  <option value="top-down">Top Down</option>
                  <option value="isometric">Isometric</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Color Count</label>
                <select
                  className="w-full p-2 border rounded text-black"
                  value={colorCount}
                  onChange={(e) => setColorCount(parseInt(e.target.value))}
                >
                  <option value="4">4 Colors</option>
                  <option value="8">8 Colors</option>
                  <option value="16">16 Colors</option>
                  <option value="32">32 Colors</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Number of Frames</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded text-black"
                  min="2"
                  max="12"
                  value={frameCount}
                  onChange={(e) => setFrameCount(Math.max(2, Math.min(12, parseInt(e.target.value) || 2)))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Split Direction</label>
                <select
                  className="w-full p-2 border rounded text-black"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'horizontal' | 'vertical' | 'grid')}
                >
                  <option value="grid">Grid (Boxes)</option>
                  <option value="horizontal">Horizontal (Row)</option>
                  <option value="vertical">Vertical (Column)</option>
                </select>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleGenerateFromPrompt}
                disabled={loading || !customPrompt.trim() || !localApiKey}
              >
                {loading && loadingMessage.includes('Generating') ? 'Generating...' : 'Generate From Prompt'}
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleProceedToAdjust}
                disabled={loading || !imageUrl}
              >
                Adjust Image
              </button>
            </div>
          </div>
        )}
        
        {step === 'preview' && (
          <div>
            <div className="mb-4">
              <p className="text-gray-800 dark:text-white mb-2">
                Generated {generatedFrames.length} frames. You can now import them into your animation.
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-6 max-h-64 overflow-y-auto">
              {generatedFrames.map((frame, index) => (
                <div key={index} className="border rounded p-1">
                  <img 
                    src={frame.src} 
                    alt={`Frame ${index + 1}`} 
                    className="w-full aspect-square object-contain"
                  />
                  <div className="text-xs text-center mt-1">Frame {index + 1}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-secondary"
                onClick={() => setStep('adjust')}
                disabled={loading}
              >
                Back
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleImport}
              >
                Import Frames
              </button>
            </div>
          </div>
        )}
        
        {step === 'adjust' && (
          <div>
            <div className="mb-4">
              <p className="text-gray-800 dark:text-white mb-2">
                Adjust grid lines to customize how the image will be split. Drag the blue handles to move the lines.
              </p>
            </div>
            
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Grid Size</label>
                <select
                  className="w-full p-2 border rounded text-black"
                  value={gridSize}
                  onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
                >
                  <option value="8">8x8 pixels</option>
                  <option value="16">16x16 pixels</option>
                  <option value="32">32x32 pixels</option>
                  <option value="64">64x64 pixels</option>
                  <option value="128">128x128 pixels</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-white mb-1">Number of Frames</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  min="2"
                  max="12"
                  value={frameCount}
                  onChange={(e) => setFrameCount(Math.max(2, Math.min(12, parseInt(e.target.value) || 2)))}
                />
              </div>
            </div>
            
            <div className="mb-6 flex justify-center">
              <div className="relative border-2 border-gray-300 rounded">
                <canvas
                  ref={previewCanvasRef}
                  className="block max-w-full cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                <div className="absolute bottom-2 right-2 bg-blue-100 dark:bg-blue-800 p-1 rounded text-xs">
                  Drag blue handles to adjust grid lines
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-secondary"
                onClick={() => setStep('input')}
                disabled={loading}
              >
                Back
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSplitImage}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Split Image'}
              </button>
            </div>
          </div>
        )}
        
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default SpecialModeDialog;
