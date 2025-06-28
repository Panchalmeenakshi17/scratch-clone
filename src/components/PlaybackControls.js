'use client';
import React from 'react';
import { motion } from 'framer-motion';

const PlaybackControls = ({ 
  onPlay, 
  onPause, 
  onStop, 
  onRemoveSprite,
  isPlaying, 
  selectedSpriteId, 
  sprites,
  spriteActions,
  playForAll,
  setPlayForAll
}) => {
  const selectedSprite = sprites.find(s => s.id === selectedSpriteId);
  const hasActions = selectedSpriteId && spriteActions[selectedSpriteId]?.length > 0;
  const totalSpritesWithActions = Object.keys(spriteActions).filter(
    id => spriteActions[id]?.length > 0
  ).length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="font-bold text-gray-800 text-lg mb-4">Controls</h3>
      
      <div className="space-y-4">
        {/* Playback Controls */}
        <div className="flex space-x-2">
          <motion.button
            onClick={onPlay}
            disabled={!hasActions}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all ${
              hasActions && !isPlaying
                ? 'bg-green-500 hover:bg-green-600 shadow-md'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            whileHover={hasActions && !isPlaying ? { scale: 1.02 } : {}}
            whileTap={hasActions && !isPlaying ? { scale: 0.98 } : {}}
          >
            {isPlaying ? (
              <span className="flex items-center justify-center">
                ⏸️ Playing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                ▶️ Play
              </span>
            )}
          </motion.button>

          <motion.button
            onClick={onPause}
            disabled={!isPlaying}
            className={`px-4 py-3 rounded-lg font-medium text-white transition-all ${
              isPlaying
                ? 'bg-yellow-500 hover:bg-yellow-600 shadow-md'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            whileHover={isPlaying ? { scale: 1.02 } : {}}
            whileTap={isPlaying ? { scale: 0.98 } : {}}
          >
            ⏸️
          </motion.button>

          <motion.button
            onClick={onStop}
            disabled={!hasActions && !isPlaying}
            className={`px-4 py-3 rounded-lg font-medium text-white transition-all ${
              hasActions || isPlaying
                ? 'bg-red-500 hover:bg-red-600 shadow-md'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            whileHover={hasActions || isPlaying ? { scale: 1.02 } : {}}
            whileTap={hasActions || isPlaying ? { scale: 0.98 } : {}}
          >
            ⏹️
          </motion.button>
        </div>

        {/* Play for All Option */}
        {totalSpritesWithActions > 1 && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={playForAll}
                onChange={(e) => setPlayForAll(e.target.checked)}
                className="w-4 h-4 text-purple-600"
                disabled={isPlaying}
              />
              <span className="text-sm font-medium text-purple-700">
                Play actions for all sprites simultaneously
              </span>
            </label>
            <p className="text-xs text-purple-600 mt-1">
              {totalSpritesWithActions} sprites have actions queued
            </p>
          </div>
        )}

        {/* Selected Sprite Info */}
        {selectedSprite && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Selected: {selectedSprite.name}
                </p>
                <p className="text-xs text-blue-600">
                  Actions: {spriteActions[selectedSpriteId]?.length || 0}
                </p>
              </div>
              <motion.button
                onClick={() => onRemoveSprite(selectedSpriteId)}
                disabled={isPlaying}
                className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium transition-all disabled:opacity-50"
                whileHover={!isPlaying ? { scale: 1.05 } : {}}
                whileTap={!isPlaying ? { scale: 0.95 } : {}}
              >
                Remove Sprite
              </motion.button>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="text-center">
          {!hasActions && !isPlaying && (
            <p className="text-sm text-gray-500">
              Add actions to sprites to enable playback
            </p>
          )}
          {isPlaying && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
              <span className="text-sm text-green-600 font-medium">
                Executing actions...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;