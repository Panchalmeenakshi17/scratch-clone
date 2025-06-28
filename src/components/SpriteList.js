'use client';
import React from 'react';
import { motion } from 'framer-motion';

const SpriteList = ({ 
  sprites, 
  selectedSpriteId, 
  onSpriteSelect, 
  availableSprites, 
  onAddSprite 
}) => {
  const handleSpriteFromLibrary = (spriteType) => {
    onAddSprite(spriteType);
  };

  const handleDragStart = (e, sprite) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'sprite',
      spriteType: sprite.name,
      name: sprite.name
    }));
  };

  const handleAvailableDragStart = (e, spriteType) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'sprite',
      spriteType: spriteType,
      name: spriteType
    }));
  };

  return (
    <div className="space-y-4">
      {/* Current Sprites */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Active Sprites</h3>
        <div className="grid grid-cols-1 gap-2">
          {sprites.map(sprite => (
            <motion.button
              key={sprite.id}
              onClick={() => onSpriteSelect(sprite.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, sprite)}
              className={`p-3 rounded-lg border-2 transition-all cursor-move ${
                sprite.id === selectedSpriteId
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {sprite.name === 'Cat' ? '🐱' : sprite.name === 'Dog' ? '🐶' : '⚽'}
                </span>
                <div className="text-left">
                  <div className="font-medium">{sprite.name}</div>
                  <div className="text-xs text-gray-500">x: {Math.round(sprite.x)}, y: {Math.round(sprite.y)}</div>
                </div>
              </div>
            </motion.button>
          ))}
          
          {sprites.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No sprites added yet
            </div>
          )}
        </div>
      </div>

      {/* Available Sprites Library */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Sprite Library</h3>
        <div className="grid grid-cols-1 gap-2">
          {availableSprites?.map(spriteType => (
            <motion.div
              key={spriteType}
              draggable
              onDragStart={(e) => handleAvailableDragStart(e, spriteType)}
              onClick={() => handleSpriteFromLibrary(spriteType)}
              className="p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {spriteType === 'Cat' ? '🐱' : spriteType === 'Dog' ? '🐶' : '⚽'}
                </span>
                <div className="text-left">
                  <div className="font-medium text-gray-700">{spriteType}</div>
                  <div className="text-xs text-gray-500">Click or drag to stage</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-bold text-gray-700 mb-2">How to Use:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Drag sprites from library to stage</li>
          <li>• Click sprites to select them</li>
          <li>• Use blocks to control selected sprite</li>
          <li>• Drag sprites around the stage</li>
          <li>• Watch for collision effects! 🚀</li>
        </ul>
      </div>
    </div>
  );
};

export default SpriteList;