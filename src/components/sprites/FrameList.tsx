import React from 'react';
import Image from 'next/image';

interface Frame {
  id: number;
  filename: string;
  src: string;
}

interface FrameListProps {
  frames: Frame[];
  activeFrameIndex: number;
  onSelectFrame: (index: number) => void;
  onMoveFrame: (index: number, direction: 'up' | 'down') => void;
  onDeleteFrame: (index: number) => void;
}

const FrameList = ({
  frames,
  activeFrameIndex,
  onSelectFrame,
  onMoveFrame,
  onDeleteFrame
}: FrameListProps) => {
  return (
    <div className="panel h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Frames</h2>
      </div>
      <div className="overflow-y-auto flex-1">
        {frames.map((frame, index) => (
          <div 
            key={frame.id}
            className={`frame-item ${activeFrameIndex === index ? 'active' : ''}`}
            onClick={() => onSelectFrame(index)}
          >
            <div className="flex items-center">
              <div className="relative w-12 h-12 mr-3 bg-gray-100 rounded overflow-hidden">
                <Image
                  src={frame.src}
                  alt={`Frame ${index + 1}`}
                  layout="fill"
                  objectFit="contain"
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
        ))}
      </div>
    </div>
  );
};

export default FrameList;
