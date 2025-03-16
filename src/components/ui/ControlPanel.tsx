import React, { useState } from 'react';

interface ControlPanelProps {
  onSpecialModeToggle?: () => void;
  style: string;
  onStyleChange: (style: string) => void;
  object: string;
  onObjectChange: (object: string) => void;
  action: string;
  onActionChange: (action: string) => void;
  background: string;
  onBackgroundChange: (background: string) => void;
  framesGenerated: number;
  totalFrames: number;
  onTotalFramesChange: (count: number) => void;
  onGenerate: () => void;
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
  apiKey?: string;
  onApiKeyChange?: (apiKey: string) => void;
  onRegenerate?: () => void;
  // Advanced animation options
  animationType?: string;
  onAnimationTypeChange?: (type: string) => void;
  easing?: string;
  onEasingChange?: (easing: string) => void;
  specialModeActive?: boolean;
}

const ControlPanel = ({
  style,
  onStyleChange,
  object,
  onObjectChange,
  action,
  onActionChange,
  background,
  onBackgroundChange,
  framesGenerated,
  totalFrames,
  onTotalFramesChange,
  onGenerate,
  prompt = '',
  onPromptChange = () => {},
  apiKey = '',
  onApiKeyChange = () => {},
  onRegenerate = () => {},
  animationType = 'loop',
  onAnimationTypeChange = () => {},
  easing = 'linear',
  onEasingChange = () => {},
  onSpecialModeToggle = () => {},
  specialModeActive = false
}: ControlPanelProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <div className="panel mb-4">
      <div className="mb-4">
        <button 
          className="btn btn-secondary w-full mb-4 flex items-center justify-center"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="ml-2"
          >
            {showAdvanced ? (
              <polyline points="18 15 12 9 6 15"></polyline>
            ) : (
              <polyline points="6 9 12 15 18 9"></polyline>
            )}
          </svg>
        </button>
      </div>
      
      {/* Advanced Settings */}
      {showAdvanced && (
        <div>
          <div className="flex justify-center mb-4">
            <button 
              className={`btn ${specialModeActive ? 'btn-primary shadow-glow' : 'btn-secondary'} w-full`}
              onClick={onSpecialModeToggle}
            >
              <div className="flex items-center justify-center gap-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="M20 12h2" />
                  <path d="M2 12h2" />
                  <path d="M19.07 4.93l-1.41 1.41" />
                  <path d="M4.93 19.07l1.41-1.41" />
                  <path d="M19.07 19.07l-1.41-1.41" />
                  <path d="M4.93 4.93l1.41 1.41" />
                </svg>
                <span>Special Mode {specialModeActive ? 'Active' : ''}</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
            <div className="control-label">API Key</div>
            <input
              type="password"
              className="control-input w-full p-2 border rounded"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Enter your Gemini API key"
            />
            <div className="text-xs text-gray-500 mt-1">
              Required for image generation via Gemini AI
            </div>
            </div>
            
            <div>
            <div className="control-label">Animation Type</div>
            <select 
              className="control-select"
              value={animationType}
              onChange={(e) => onAnimationTypeChange(e.target.value)}
            >
              <option value="loop">Loop</option>
              <option value="bounce">Bounce (Ping-Pong)</option>
              <option value="once">Play Once</option>
              <option value="reverse">Reverse Loop</option>
            </select>
            </div>
            
            <div>
            <div className="control-label">Easing</div>
            <select 
              className="control-select"
              value={easing}
              onChange={(e) => onEasingChange(e.target.value)}
            >
              <option value="linear">Linear</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In-Out</option>
            </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="col-span-2">
          <div className="control-label">Custom Prompt</div>
          <textarea
            className="control-input w-full h-24 p-2 border rounded"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Enter a custom prompt for image generation, or use the parameters below"
          />
        </div>
        
        <div>
          <div className="control-label">Style</div>
          <select 
            className="control-select"
            value={style}
            onChange={(e) => onStyleChange(e.target.value)}
          >
            <option value="8-bit">8-bit</option>
            <option value="16-bit">16-bit</option>
            <option value="pixel-art">Pixel Art</option>
            <option value="retro">Retro</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div>
          <div className="control-label">Object</div>
          <select 
            className="control-select"
            value={object}
            onChange={(e) => onObjectChange(e.target.value)}
          >
            <option value="goblin">goblin</option>
            <option value="knight">knight</option>
            <option value="mage">mage</option>
            <option value="archer">archer</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div>
          <div className="control-label">Action</div>
          <select 
            className="control-select"
            value={action}
            onChange={(e) => onActionChange(e.target.value)}
          >
            <option value="dancing">dancing</option>
            <option value="walking">walking</option>
            <option value="running">running</option>
            <option value="attacking">attacking</option>
            <option value="idle">idle</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div>
          <div className="control-label">Background</div>
          <select 
            className="control-select"
            value={background}
            onChange={(e) => onBackgroundChange(e.target.value)}
          >
            <option value="in the battlefield">in the battlefield</option>
            <option value="forest">forest</option>
            <option value="dungeon">dungeon</option>
            <option value="transparent">transparent</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
      
      <div className="relative pt-1 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm text-gray-600">
            {framesGenerated} of {totalFrames} frames generated
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Frame Count:</span>
            <select
              className="control-select-sm"
              value={totalFrames}
              onChange={(e) => onTotalFramesChange(parseInt(e.target.value))}
            >
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
            </select>
          </div>
        </div>
        <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
          <div 
            style={{ width: `${(framesGenerated / totalFrames) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
          ></div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Complete: &quot;8-bit&quot; + &quot;character&quot; + &quot;walking&quot; or &quot;pixel art&quot; + &quot;explosion&quot; + &quot;in sequence&quot;
      </div>
      
      <div className="flex gap-2">
        <button 
          className="btn btn-primary flex-1"
          onClick={onGenerate}
          disabled={showAdvanced && !apiKey && prompt.trim().length > 0}
        >
          Generate Frames
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={onRegenerate}
          disabled={framesGenerated === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
