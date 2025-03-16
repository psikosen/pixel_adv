"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import PixelPerfectImage from './PixelPerfectImage';
import { getFrameDuration } from '../../lib/animation/easingFunctions';

interface AnimationPreviewProps {
  frames: string[];
  speed: number;
  isPlaying: boolean;
  currentFrameIndex: number;
  onFrameChange: (index: number) => void;
  animationType?: 'loop' | 'bounce' | 'once' | 'reverse';
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

const AnimationPreview = ({
  frames,
  speed,
  isPlaying,
  currentFrameIndex,
  onFrameChange,
  animationType = 'loop',
  easing = 'linear'
}: AnimationPreviewProps) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Calculate FPS based on speed (1-10 scale)
  const fps = Math.max(1, Math.min(24, speed * 2.4));
  // Base frame duration (without easing)
  const baseDuration = 1000 / fps;
  
  console.log('Animation speed:', speed, 'fps:', fps, 'duration:', baseDuration);
  
  // Reset animation complete state when playing status changes
  useEffect(() => {
    if (isPlaying) {
      setAnimationComplete(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (frames.length === 0) return;
    
    const img = new Image();
    img.src = frames[currentFrameIndex];
    img.onload = () => {
      setImageObj(img);
    };
  }, [frames, currentFrameIndex]);

  useEffect(() => {
    if (!isPlaying || frames.length <= 1 || animationComplete) return;
    
    const animate = (timestamp: number) => {
      // Apply easing to determine the duration for the current frame
      const frameDuration = getFrameDuration(
        easing, 
        baseDuration, 
        frames.length, 
        currentFrameIndex
      );
      
      if (timestamp - lastFrameTimeRef.current >= frameDuration) {
        lastFrameTimeRef.current = timestamp;
        
        let nextIndex = currentFrameIndex;
        
        // Determine next frame based on animation type
        switch (animationType) {
          case 'loop':
            nextIndex = (currentFrameIndex + 1) % frames.length;
            break;
            
          case 'bounce':
            if (direction === 'forward') {
              nextIndex = currentFrameIndex + 1;
              if (nextIndex >= frames.length - 1) {
                nextIndex = frames.length - 1;
                setDirection('backward');
              }
            } else {
              nextIndex = currentFrameIndex - 1;
              if (nextIndex <= 0) {
                nextIndex = 0;
                setDirection('forward');
              }
            }
            break;
            
          case 'once':
            nextIndex = currentFrameIndex + 1;
            if (nextIndex >= frames.length) {
              // Stop at the last frame
              nextIndex = frames.length - 1;
              setAnimationComplete(true);
            }
            break;
            
          case 'reverse':
            nextIndex = currentFrameIndex - 1;
            if (nextIndex < 0) {
              nextIndex = frames.length - 1;
            }
            break;
        }
        
        onFrameChange(nextIndex);
      }
      
      if (!animationComplete) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentFrameIndex, frames.length, baseDuration, easing, onFrameChange, animationType, direction, animationComplete]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Animation Preview</h2> 
      </div>
      
      <div className="mb-2 text-xs">
        <span className="font-medium">Mode:</span> {animationType} | 
        <span className="font-medium">Easing:</span> {easing}
      </div>
      
      <div className="animation-preview flex-1 flex items-center justify-center">
        {imageObj ? (
          <Stage 
            width={300} 
            height={300}
          >
            <Layer imageSmoothingEnabled={false}>
              <PixelPerfectImage
                image={imageObj}
                containerWidth={300}
                containerHeight={300}
              />
            </Layer>
          </Stage>
        ) : (
          <div className="text-gray-400">No frames to display</div>
        )}
      </div>
      
  
    </div>
  );
};

export default AnimationPreview;
