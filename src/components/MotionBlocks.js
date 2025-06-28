'use client';
import React from 'react';
import { motion } from 'framer-motion';

const MotionBlocks = ({ onBlockClick, selectedSpriteId, isPlaying }) => {
  const motionBlocks = [
    { id: 'move-right', label: 'Move 20 steps →', color: 'bg-blue-500', action: 'moveRight' },
    { id: 'move-left', label: 'Move 20 steps ←', color: 'bg-blue-500', action: 'moveLeft' },
    { id: 'turn-right', label: 'Turn clockwise 15°', color: 'bg-blue-600', action: 'turnRight' },
    { id: 'turn-left', label: 'Turn counter-clockwise 15°', color: 'bg-blue-600', action: 'turnLeft' },
    { id: 'spin-360', label: '🌀 Spin 360° (Full Circle)', color: 'bg-blue-700', action: 'spin360' },
  ];

  const handleDragStart = (e, block) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'block',
      action: block.action,
      label: block.label
    }));
  };

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-blue-700 text-lg border-b-2 border-blue-200 pb-2">
        Motion Blocks
      </h3>
      {motionBlocks.map(block => (
        <motion.button
          key={block.id}
          onClick={() => selectedSpriteId && !isPlaying && onBlockClick(block.action, selectedSpriteId)}
          onDragStart={(e) => handleDragStart(e, block)}
          draggable
          disabled={!selectedSpriteId || isPlaying}
          className={`${block.color} ${
            selectedSpriteId && !isPlaying
              ? 'hover:opacity-90 cursor-pointer hover:shadow-lg' 
              : 'opacity-50 cursor-not-allowed'
          } text-white px-4 py-3 rounded-xl font-medium text-sm w-full text-left transition-all shadow-md ${
            block.id === 'spin-360' ? 'animate' : ''
          }`}
          whileHover={selectedSpriteId && !isPlaying ? { scale: 1.02, y: -1, rotate: block.id === 'spin-360' ? 5 : 0 } : {}}
          whileTap={selectedSpriteId && !isPlaying ? { scale: 0.98 } : {}}
        >
          {block.label}
        </motion.button>
      ))}
      
      {(!selectedSpriteId || isPlaying) && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
          {!selectedSpriteId ? 'Select a sprite to use motion blocks' : 'Cannot add actions while playing'}
        </div>
      )}
    </div>
  );
};

export default MotionBlocks;