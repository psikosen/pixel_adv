import React from 'react';
import { calculateFps } from '../../lib/animation/animationUtils';

interface AnimationControlsProps {
  isPlaying: boolean;
  onPlayPauseToggle: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentFrame: number;
  totalFrames: number;
}

const AnimationControls = ({
  isPlaying,
  onPlayPauseToggle,
  speed,
  onSpeedChange,
  currentFrame,
  totalFrames
}: AnimationControlsProps) => {
  const fps = calculateFps(speed);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button 
            className="btn btn-secondary flex items-center justify-center w-20"
            onClick={onPlayPauseToggle}
            disabled={totalFrames === 0}
          >
            {isPlaying ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Play
              </>
            )}
          </button>
        </div>
        
        <div className="text-sm font-medium">
          Frame {currentFrame + 1} of {totalFrames} ({fps.toFixed(0)} FPS)
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm mr-2">Speed</span>
        <div className="flex-1 mx-2">
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value))}
            className="slider w-full"
            disabled={totalFrames === 0}
          />
        </div>
        <span className="text-sm ml-2">{speed}</span>
      </div>
    </div>
  );
};

export default AnimationControls;
