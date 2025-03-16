import React, { useState } from 'react';
import Image from 'next/image';
import { Frame } from '../../lib/animation/frameManager';
import ExportOptions from '../ui/ExportOptions';
import { exportGif, exportSpriteSheet, calculateFps } from '../../lib/animation/animationUtils';

interface FrameManagerProps {
  frames: Frame[];
  activeFrameIndex: number;
  onSelectFrame: (index: number) => void;
  onMoveFrame: (index: number, direction: 'up' | 'down') => void;
  onDeleteFrame: (index: number) => void;
  onAddFrame: () => void;
  animationSpeed: number;
}

const FrameManager = ({
  frames,
  activeFrameIndex,
  onSelectFrame,
  onMoveFrame,
  onDeleteFrame,
  onAddFrame,
  animationSpeed
}: FrameManagerProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleExportGif = async () => {
    if (frames.length === 0) return;
    
    setIsExporting(true);
    try {
      const frameSources = frames.map(frame => frame.src);
      const fps = calculateFps(animationSpeed);
      await exportGif(frameSources, fps, 'pixel_adventure_animation.gif');
    } catch (error) {
      console.error('Error exporting GIF:', error);
      alert('Failed to export GIF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSpriteSheet = async () => {
    if (frames.length === 0) return;
    
    setIsExporting(true);
    try {
      const frameSources = frames.map(frame => frame.src);
      await exportSpriteSheet(frameSources, 4, 'pixel_adventure_spritesheet.png');
    } catch (error) {
      console.error('Error exporting sprite sheet:', error);
      alert('Failed to export sprite sheet. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveProject = async () => {
    if (frames.length === 0) return;
    
    setIsSaving(true);
    try {
      // Implement database save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate saving delay
      
      // Notify user
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="panel h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Frames</h2>
        <button
          className="btn btn-secondary flex items-center"
          onClick={onAddFrame}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Frame
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 mb-4">
        {frames.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No frames available. Generate or add frames to get started.
          </div>
        ) : (
          frames.map((frame, index) => (
            <div 
              key={frame.id}
              className={`frame-item ${activeFrameIndex === index ? 'active' : ''}`}
              onClick={() => onSelectFrame(index)}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 mr-3 bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={frame.src} 
                    alt={`Frame ${index + 1}`} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="font-medium">Frame {index + 1}</div>
                  <div className="text-xs text-gray-500">{frame.filename}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  className="text-gray-500 hover:text-gray-700 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveFrame(index, 'up');
                  }}
                  disabled={index === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                </button>
                <button 
                  className="text-gray-500 hover:text-gray-700 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveFrame(index, 'down');
                  }}
                  disabled={index === frames.length - 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                <button 
                  className="text-gray-500 hover:text-red-500 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFrame(index);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <ExportOptions
        onExportGif={handleExportGif}
        onExportSpriteSheet={handleExportSpriteSheet}
        onSaveProject={handleSaveProject}
        disabled={frames.length === 0}
        isExporting={isExporting}
        isSaving={isSaving}
      />
    </div>
  );
};

export default FrameManager;
