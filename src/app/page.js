
'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Enhanced Animals List with more variety
const ANIMALS_LIST = {
  'Cat': '🐱', 'Dog': '🐶', 'Lion': '🦁', 'Tiger': '🐅', 'Bear': '🐻',
  'Fox': '🦊', 'Wolf': '🐺', 'Panda': '🐼', 'Monkey': '🐵', 'Elephant': '🐘',
  'Rabbit': '🐰', 'Horse': '🐴', 'Cow': '🐄', 'Pig': '🐷', 'Sheep': '🐑',
  'Chicken': '🐔', 'Duck': '🦆', 'Penguin': '🐧', 'Fish': '🐟', 'Butterfly': '🦋',
  'Frog': '🐸', 'Bird': '🐦', 'Turtle': '🐢', 'Octopus': '🐙', 'Shark': '🦈'
};

// Enhanced sprite actions with better descriptions
const spriteActions = {
  moveSteps: (steps) => ({ type: 'moveSteps', steps }),
  turnDegrees: (degrees) => ({ type: 'turnDegrees', degrees }),
  goToXY: (x, y) => ({ type: 'goToXY', x, y }),
  repeat: (actions, times) => ({ type: 'repeat', actions, times }),
  sayFor: (text, seconds) => ({ type: 'sayFor', text, seconds }),
  thinkFor: (text, seconds) => ({ type: 'thinkFor', text, seconds }),
  
  // Predefined human-friendly actions
  moveRight: { type: 'moveSteps', steps: 30 },
  moveLeft: { type: 'moveSteps', steps: -30 },
  moveUp: { type: 'moveSteps', steps: 30, direction: 'up' },
  moveDown: { type: 'moveSteps', steps: 30, direction: 'down' },
  spin360: { type: 'turnDegrees', degrees: 360 },
  sayHello: { type: 'sayFor', text: 'Hello there! 👋', seconds: 2 },
  thinkHmm: { type: 'thinkFor', text: 'Let me think... 🤔', seconds: 2 }
};

// Fixed responsive hook - ALWAYS called at the top level
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return { ...screenSize, isClient };
};

// Enhanced stage dimensions calculator
const useStageSize = (screenSize) => {
  return {
    width: screenSize.isMobile 
      ? Math.min(screenSize.width - 32, 350)
      : screenSize.isTablet 
        ? Math.min(screenSize.width * 0.55, 500)
        : Math.min(screenSize.width * 0.45, 650),
    height: screenSize.isMobile 
      ? Math.min((screenSize.width - 32) * 0.75, 262)
      : screenSize.isTablet 
        ? Math.min(screenSize.width * 0.55 * 0.75, 375)
        : Math.min(screenSize.width * 0.45 * 0.75, 487)
  };
};

// FIXED: Enhanced executeAction with proper step logic
const executeAction = async (sprite, action, setSprites, stageWidth, stageHeight) => {
  return new Promise((resolve) => {
    if (typeof action === 'string') {
      action = spriteActions[action];
    }

    switch (action.type) {
      case 'repeat':
        const executeRepeat = async () => {
          for (let i = 0; i < action.times; i++) {
            for (const nestedAction of action.actions) {
              await executeAction(sprite, nestedAction, setSprites, stageWidth, stageHeight);
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          resolve();
        };
        executeRepeat();
        break;
        
      case 'moveSteps':
        // FIXED: Each step is now 1 pixel, so 10 steps = 10 pixels movement
        setSprites(prevSprites => 
          prevSprites.map(s => {
            if (s.id === sprite.id) {
              const radians = (s.rotation * Math.PI) / 180;
              let newX = s.x;
              let newY = s.y;
              
              if (action.direction === 'up') {
                newY = Math.max(30, Math.min(stageHeight - 30, s.y - action.steps));
              } else if (action.direction === 'down') {
                newY = Math.max(30, Math.min(stageHeight - 30, s.y + action.steps));
              } else {
                // FIXED: Direct pixel movement - 10 steps = 10 pixels
                newX = Math.max(30, Math.min(stageWidth - 30, s.x + action.steps * Math.cos(radians)));
                newY = Math.max(30, Math.min(stageHeight - 30, s.y + action.steps * Math.sin(radians)));
              }
              
              return { ...s, x: newX, y: newY };
            }
            return s;
          })
        );
        // Animation duration based on distance for visual feedback
        setTimeout(resolve, Math.min(500, Math.abs(action.steps) * 20));
        break;
        
      case 'turnDegrees':
        setSprites(prevSprites => 
          prevSprites.map(s => 
            s.id === sprite.id 
              ? { ...s, rotation: s.rotation + action.degrees }
              : s
          )
        );
        setTimeout(resolve, 300);
        break;
        
      case 'goToXY':
        setSprites(prevSprites => 
          prevSprites.map(s => 
            s.id === sprite.id 
              ? { ...s, x: Math.max(30, Math.min(stageWidth - 30, action.x)), y: Math.max(30, Math.min(stageHeight - 30, action.y)) }
              : s
          )
        );
        setTimeout(resolve, 500);
        break;
        
      case 'sayFor':
        setSprites(prevSprites => 
          prevSprites.map(s => 
            s.id === sprite.id 
              ? { ...s, speech: action.text, speechType: 'say' }
              : s
          )
        );
        setTimeout(() => {
          setSprites(prevSprites => 
            prevSprites.map(s => 
              s.id === sprite.id 
                ? { ...s, speech: '', speechType: '' }
                : s
            )
          );
          resolve();
        }, action.seconds * 1000);
        break;
        
      case 'thinkFor':
        setSprites(prevSprites => 
          prevSprites.map(s => 
            s.id === sprite.id 
              ? { ...s, speech: action.text, speechType: 'think' }
              : s
          )
        );
        setTimeout(() => {
          setSprites(prevSprites => 
            prevSprites.map(s => 
              s.id === sprite.id 
                ? { ...s, speech: '', speechType: '' }
                : s
            )
          );
          resolve();
        }, action.seconds * 1000);
        break;
        
      default:
        resolve();
    }
  });
};

// Responsive Sprite Library Component
const SpriteLibraryOverlay = ({ isOpen, onClose, onAddSprite, onAddRandomAnimal, isPlaying, availableSprites, screenSize }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 max-h-[80vh] overflow-y-auto ${
          screenSize.isMobile ? 'w-full max-w-sm' : 'max-w-md w-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3 ${
            screenSize.isMobile ? 'text-xl' : 'text-2xl'
          }`}>
            <span className="text-2xl">🎯</span> Choose Your Character
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {/* Random Animal First */}
          <motion.button
            onClick={onAddRandomAnimal}
            disabled={isPlaying}
            className={`bg-gradient-to-r from-emerald-500 to-teal-600 ${
              isPlaying ? 'opacity-50' : 'hover:shadow-lg hover:scale-[1.02] active:scale-95'
            } text-white px-4 py-4 rounded-xl text-sm font-medium w-full transition-all duration-200 flex items-center gap-3 shadow-md border-2 border-white/20`}
            whileHover={!isPlaying ? { y: -2 } : {}}
          >
            <span className="text-xl">🎲</span>
            <div className="text-left">
              <div className="font-semibold">Surprise Me!</div>
              <div className="text-xs opacity-90">Get a random animal friend</div>
            </div>
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500 font-medium">OR PICK ONE</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Available Sprites Grid */}
          <div className={`grid gap-3 ${screenSize.isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {availableSprites.map((sprite, index) => (
              <motion.button
                key={sprite.name}
                onClick={() => onAddSprite(sprite)}
                disabled={isPlaying}
                className={`bg-gradient-to-r ${sprite.color} ${
                  isPlaying ? 'opacity-50' : 'hover:shadow-lg hover:scale-[1.02] active:scale-95'
                } text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 shadow-md`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={!isPlaying ? { y: -2 } : {}}
              >
                <span className="text-xl">{sprite.emoji}</span>
                <div className="text-left">
                  <div className="font-semibold">{sprite.name}</div>
                  <div className="text-xs opacity-90">Add to stage</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Animal Name Popup
const AnimalNamePopup = ({ isOpen, onClose, onConfirm, randomAnimal, screenSize }) => {
  const [animalName, setAnimalName] = useState('');

  useEffect(() => {
    if (isOpen && randomAnimal) {
      setAnimalName(randomAnimal.type);
    }
  }, [isOpen, randomAnimal]);

  const handleConfirm = () => {
    if (animalName.trim()) {
      onConfirm(animalName.trim());
      setAnimalName('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  if (!isOpen || !randomAnimal) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 ${
          screenSize.isMobile ? 'w-full max-w-sm' : 'max-w-sm w-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            {randomAnimal.emoji}
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Name Your {randomAnimal.type}
          </h3>
          <p className="text-sm text-gray-600">
            Give your new friend a special name
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={animalName}
            onChange={(e) => setAnimalName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`My ${randomAnimal.type}'s name is...`}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            autoFocus
            maxLength={20}
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
            >
              Maybe Later
            </button>
            <button
              onClick={handleConfirm}
              disabled={!animalName.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
            >
              Add Friend!
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Draggable Block Component
const DraggableBlock = ({ block, isPlaying, children, screenSize }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: { 
      blockData: block,
      id: `${block.id}-${Date.now()}`
    },
    canDrag: !isPlaying,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [block, isPlaying]);

  return (
    <div
      ref={drag}
      className={`${isDragging ? 'opacity-50' : 'opacity-100'} ${
        isPlaying ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
      } touch-manipulation`}
    >
      {children}
    </div>
  );
};

// FIXED: Enhanced Motion Blocks with proper step explanation
const MotionBlocks = ({ isPlaying, screenSize }) => {
  const [customSteps, setCustomSteps] = useState(50);
  const [customDegrees, setCustomDegrees] = useState(90);
  const [customX, setCustomX] = useState(100);
  const [customY, setCustomY] = useState(100);
  const [repeatTimes, setRepeatTimes] = useState(3);

  const motionBlocks = [
    {
      id: 'moveSteps',
      label: 'walk',
      subLabel: `${customSteps} pixels`,
      gradient: 'from-blue-500 to-blue-600',
      icon: '🚶',
      action: { type: 'moveSteps', steps: customSteps },
      customInput: (
        <input
          type="number"
          value={customSteps}
          onChange={(e) => setCustomSteps(parseInt(e.target.value) || 0)}
          className={`${screenSize.isMobile ? 'w-12 text-xs' : 'w-14 text-xs'} bg-white/95 border border-blue-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all`}
          disabled={isPlaying}
          onClick={(e) => e.stopPropagation()}
          min="1"
          max="200"
        />
      )
    },
    {
      id: 'turnDegrees',
      label: 'spin',
      subLabel: 'degrees',
      gradient: 'from-indigo-500 to-purple-600',
      icon: '🌪️',
      action: { type: 'turnDegrees', degrees: customDegrees },
      customInput: (
        <input
          type="number"
          value={customDegrees}
          onChange={(e) => setCustomDegrees(parseInt(e.target.value) || 0)}
          className={`${screenSize.isMobile ? 'w-12 text-xs' : 'w-14 text-xs'} bg-white/95 border border-purple-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all`}
          disabled={isPlaying}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    {
      id: 'goToXY',
      label: 'jump to',
      subLabel: 'position',
      gradient: 'from-teal-500 to-cyan-600',
      icon: '🎯',
      action: { type: 'goToXY', x: customX, y: customY },
      customInput: (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            value={customX}
            onChange={(e) => setCustomX(parseInt(e.target.value) || 0)}
            className={`${screenSize.isMobile ? 'w-10 text-xs' : 'w-12 text-xs'} bg-white/95 border border-teal-200 rounded-lg px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all`}
            disabled={isPlaying}
            placeholder="X"
          />
          <input
            type="number"
            value={customY}
            onChange={(e) => setCustomY(parseInt(e.target.value) || 0)}
            className={`${screenSize.isMobile ? 'w-10 text-xs' : 'w-12 text-xs'} bg-white/95 border border-teal-200 rounded-lg px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all`}
            disabled={isPlaying}
            placeholder="Y"
          />
        </div>
      )
    },
    {
      id: 'repeat',
      label: 'repeat last 2 actions',
      subLabel: 'times',
      gradient: 'from-orange-500 to-red-600',
      icon: '🔄',
      action: { type: 'repeat', times: repeatTimes, actions: [] },
      customInput: (
        <input
          type="number"
          value={repeatTimes}
          onChange={(e) => setRepeatTimes(parseInt(e.target.value) || 1)}
          className={`${screenSize.isMobile ? 'w-12 text-xs' : 'w-14 text-xs'} bg-white/95 border border-orange-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all`}
          disabled={isPlaying}
          onClick={(e) => e.stopPropagation()}
          min="1"
        />
      )
    }
  ];

  return (
    <div className="space-y-3">
      {/* Step Explanation */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-3 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-xs text-blue-700 font-semibold mb-1">📏 Step Guide:</div>
        <div className="text-xs text-blue-600">
          • 1 step = 1 pixel movement<br/>
          • 50 steps = moves 50 pixels distance<br/>
          • Higher numbers = longer distances<br/>
          • Repeat uses your LAST 2 actions
        </div>
      </motion.div>

      {motionBlocks.map((block, index) => (
        <DraggableBlock key={block.id} block={block} isPlaying={isPlaying} screenSize={screenSize}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-gradient-to-r ${block.gradient} ${
              isPlaying ? 'opacity-60' : 'hover:shadow-lg hover:scale-[1.02] active:scale-95'
            } text-white px-4 py-3 rounded-xl ${screenSize.isMobile ? 'text-sm' : 'text-sm'} font-medium w-full transition-all duration-200 flex items-center gap-3 shadow-md border border-white/20`}
          >
            <span className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} flex-shrink-0`}>{block.icon}</span>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{block.label}</span>
                {block.customInput}
                {block.subLabel && !screenSize.isMobile && <span className="text-xs opacity-90">{block.subLabel}</span>}
              </div>
            </div>
          </motion.div>
        </DraggableBlock>
      ))}
    </div>
  );
};

// Enhanced Looks Blocks
const LooksBlocks = ({ isPlaying, screenSize }) => {
  const [sayText, setSayText] = useState('Hi friend!');
  const [saySeconds, setSaySeconds] = useState(2);
  const [thinkText, setThinkText] = useState('Hmm...');
  const [thinkSeconds, setThinkSeconds] = useState(2);

  const looksBlocks = [
    {
      id: 'sayFor',
      label: 'say',
      gradient: 'from-pink-500 to-rose-600',
      icon: '💬',
      action: { type: 'sayFor', text: sayText, seconds: saySeconds },
      customInput: (
        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={sayText}
            onChange={(e) => setSayText(e.target.value)}
            className={`${screenSize.isMobile ? 'w-16 text-xs' : 'w-20 text-xs'} bg-white/95 border border-pink-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all`}
            disabled={isPlaying}
            placeholder="message"
          />
          {!screenSize.isMobile && <span className="text-xs opacity-90">for</span>}
          <input
            type="number"
            value={saySeconds}
            onChange={(e) => setSaySeconds(parseFloat(e.target.value) || 1)}
            className={`${screenSize.isMobile ? 'w-10 text-xs' : 'w-12 text-xs'} bg-white/95 border border-pink-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all`}
            disabled={isPlaying}
            min="0.1"
            step="0.1"
          />
          <span className="text-xs opacity-90">s</span>
        </div>
      )
    },
    {
      id: 'thinkFor',
      label: 'think',
      gradient: 'from-purple-500 to-indigo-600',
      icon: '💭',
      action: { type: 'thinkFor', text: thinkText, seconds: thinkSeconds },
      customInput: (
        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={thinkText}
            onChange={(e) => setThinkText(e.target.value)}
            className={`${screenSize.isMobile ? 'w-16 text-xs' : 'w-20 text-xs'} bg-white/95 border border-purple-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all`}
            disabled={isPlaying}
            placeholder="thought"
          />
          {!screenSize.isMobile && <span className="text-xs opacity-90">for</span>}
          <input
            type="number"
            value={thinkSeconds}
            onChange={(e) => setThinkSeconds(parseFloat(e.target.value) || 1)}
            className={`${screenSize.isMobile ? 'w-10 text-xs' : 'w-12 text-xs'} bg-white/95 border border-purple-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all`}
            disabled={isPlaying}
            min="0.1"
            step="0.1"
          />
          <span className="text-xs opacity-90">s</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-3">
      {looksBlocks.map((block, index) => (
        <DraggableBlock key={block.id} block={block} isPlaying={isPlaying} screenSize={screenSize}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-gradient-to-r ${block.gradient} ${
              isPlaying ? 'opacity-60' : 'hover:shadow-lg hover:scale-[1.02] active:scale-95'
            } text-white px-4 py-3 rounded-xl ${screenSize.isMobile ? 'text-sm' : 'text-sm'} font-medium w-full transition-all duration-200 flex items-center gap-3 shadow-md border border-white/20`}
          >
            <span className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} flex-shrink-0`}>{block.icon}</span>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{block.label}</span>
                {block.customInput}
              </div>
            </div>
          </motion.div>
        </DraggableBlock>
      ))}
    </div>
  );
};

// Enhanced Code Area Component
const CodeArea = ({ spriteActions, selectedSpriteId, sprites, onAddAction, onRemoveAction, onClearAllActions, isPlaying, autoExecute, screenSize }) => {
  const selectedSprite = sprites.find(s => s.id === selectedSpriteId);
  const actions = spriteActions[selectedSpriteId] || [];

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'block',
    drop: (item) => {
      if (selectedSpriteId && item.blockData) {
        let actionToAdd = item.blockData.action;
        
        // FIXED: Repeat now properly uses last 2 actions
        if (actionToAdd.type === 'repeat') {
          const lastTwoActions = actions.slice(-2);
          actionToAdd = {
            ...actionToAdd,
            actions: lastTwoActions
          };
        }
        
        onAddAction(actionToAdd, selectedSpriteId, autoExecute);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [selectedSpriteId, onAddAction, actions, autoExecute]);

  if (!selectedSpriteId) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-6xl mb-6"
        >
          🎯
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${screenSize.isMobile ? 'text-lg' : 'text-xl'} font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4`}
        >
          Pick a Character First
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-gray-500 px-4 ${screenSize.isMobile ? 'text-sm' : 'text-base'}`}
        >
          Choose a friend from the library to start creating amazing animations together!
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h4 
          className={`${screenSize.isMobile ? 'text-lg' : 'text-xl'} font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {selectedSprite?.name}'s Actions
          {autoExecute && (
            <span className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} ml-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg font-normal`}>
              🤖 AUTO
            </span>
          )}
        </motion.h4>
        {actions.length > 0 && (
          <motion.button
            onClick={() => onClearAllActions(selectedSpriteId)}
            disabled={isPlaying}
            className={`bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg transition-all ${screenSize.isMobile ? 'text-xs' : 'text-sm'}`}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Clear All
          </motion.button>
        )}
      </div>
      
      <div
        ref={drop}
        className={`${screenSize.isMobile ? 'min-h-60' : 'min-h-80'} p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isOver 
            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl scale-[1.02]' 
            : actions.length === 0
              ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50'
              : 'border-gray-200 bg-gradient-to-br from-white to-blue-50 shadow-lg'
        }`}
      >
        {actions.length === 0 ? (
          <motion.div 
            className={`flex flex-col items-center justify-center h-full text-gray-400 ${screenSize.isMobile ? 'py-12' : 'py-20'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="text-6xl mb-6"
              animate={{ 
                rotate: [0, -10, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              📝
            </motion.div>
            <motion.div 
              className={`${screenSize.isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-center`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Drag Action Blocks Here
            </motion.div>
            <motion.div 
              className={`text-center px-4 ${screenSize.isMobile ? 'text-sm' : 'text-base'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Create magical animations by combining different actions
              <br />
              <span className="text-orange-500 font-semibold">📏 Steps = Pixels (50 steps = 50 pixels distance)</span>
              <br />
              <span className="text-purple-500 font-semibold">🔄 Repeat uses your LAST 2 actions!</span>
              {autoExecute && (
                <>
                  <br />
                  <span className="text-green-600 font-semibold">🤖 Auto Mode: Actions happen instantly!</span>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <motion.div 
              className={`text-gray-600 mb-6 font-medium flex items-center gap-3 ${screenSize.isMobile ? 'text-sm' : 'text-base'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {actions.length}
              </span>
              <span className="text-sm">action{actions.length !== 1 ? 's' : ''} ready to go!</span>
            </motion.div>
            <AnimatePresence>
              {actions.map((action, index) => (
                <DroppedActionBlock
                  key={`${index}-${JSON.stringify(action)}`}
                  action={action}
                  index={index}
                  onRemove={(idx) => onRemoveAction(selectedSpriteId, idx)}
                  isPlaying={isPlaying}
                  screenSize={screenSize}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Dropped Action Block
const DroppedActionBlock = ({ action, index, onRemove, isPlaying, screenSize }) => {
  const getActionDisplay = (action) => {
    if (typeof action === 'string') {
      return action;
    }
    switch (action.type) {
      case 'moveSteps':
        return `Walk ${action.steps} pixels${action.direction ? ` ${action.direction}` : ''}`;
      case 'turnDegrees':
        return `Spin ${action.degrees}°`;
      case 'goToXY':
        return `Jump to (${action.x}, ${action.y})`;
      case 'sayFor':
        return `Say "${action.text}" for ${action.seconds}s`;
      case 'thinkFor':
        return `Think "${action.text}" for ${action.seconds}s`;
      case 'repeat':
        return `Repeat ${action.times} times (last 2 actions)`;
      default:
        return JSON.stringify(action);
    }
  };

  const getBlockColor = (action) => {
    if (typeof action === 'string') {
      if (['moveRight', 'moveLeft', 'moveUp', 'moveDown', 'spin360'].includes(action)) {
        return 'from-blue-500 to-blue-600';
      }
      if (['sayHello', 'thinkHmm'].includes(action)) {
        return 'from-purple-500 to-purple-600';
      }
    }
    switch (action.type) {
      case 'moveSteps':
      case 'turnDegrees':
      case 'goToXY':
        return 'from-blue-500 to-blue-600';
      case 'sayFor':
      case 'thinkFor':
        return 'from-purple-500 to-purple-600';
      case 'repeat':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={`bg-gradient-to-r ${getBlockColor(action)} text-white px-4 py-3 rounded-xl ${screenSize.isMobile ? 'text-sm' : 'text-sm'} font-medium flex items-center justify-between shadow-lg mb-3 border border-white/20`}
      whileHover={{ scale: 1.02, y: -1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <motion.div 
          className={`text-xs bg-white/25 rounded-full ${screenSize.isMobile ? 'w-5 h-5' : 'w-6 h-6'} flex items-center justify-center font-semibold shadow-sm flex-shrink-0`}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          {index + 1}
        </motion.div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate font-medium">{getActionDisplay(action)}</span>
          {action.type === 'repeat' && action.actions.length > 0 && (
            <div className="text-xs opacity-90 mt-1">
              {action.actions.map((subAction, i) => (
                <div key={i} className="ml-2 truncate">
                  • {getActionDisplay(subAction)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <motion.button
        onClick={() => onRemove(index)}
        disabled={isPlaying}
        className={`text-white/80 hover:text-white hover:bg-red-500/30 disabled:opacity-50 text-lg leading-none ml-3 ${screenSize.isMobile ? 'w-6 h-6' : 'w-7 h-7'} rounded-full bg-white/15 flex items-center justify-center transition-all flex-shrink-0`}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        ×
      </motion.button>
    </motion.div>
  );
};

// Enhanced Sprite Component with touch support
const Sprite = ({ sprite, isSelected, onSelect, onMove, onRemove, stageWidth, stageHeight, isPlaying, screenSize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [stageRect, setStageRect] = useState(null);

  const handleStart = (e, clientX, clientY) => {
    e.preventDefault();
    e.stopPropagation();
    
    let stageElement = e.currentTarget.parentElement;
    while (stageElement && !stageElement.classList.contains('stage-container')) {
      stageElement = stageElement.parentElement;
    }
    
    if (stageElement) {
      const rect = stageElement.getBoundingClientRect();
      setStageRect(rect);
      setDragStart({
        x: clientX - rect.left - sprite.x,
        y: clientY - rect.top - sprite.y
      });
    }
    
    setIsDragging(true);
    onSelect(sprite.id);
  };

  const handleMouseDown = (e) => {
    handleStart(e, e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.touches[0]) {
      handleStart(e, e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging || !stageRect) return;
    
    const x = Math.max(25, Math.min(stageWidth - 25, clientX - stageRect.left - dragStart.x));
    const y = Math.max(25, Math.min(stageHeight - 25, clientY - stageRect.top - dragStart.y));
    onMove(sprite.id, x, y);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches[0]) {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setStageRect(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, stageRect, dragStart]);

  const spriteSize = screenSize.isMobile ? 16 : 25;

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: sprite.x - spriteSize,
        top: sprite.y - spriteSize,
        cursor: 'pointer',
        zIndex: isSelected ? 10 : 1,
        touchAction: 'none'
      }}
      animate={{
        scale: sprite.hasCollided ? 1.3 : sprite.size,
        rotate: sprite.rotation
      }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`select-none ${isSelected ? 'ring-3 ring-blue-400 ring-offset-2 rounded-full bg-blue-50' : ''} p-2 relative group touch-manipulation`}
      whileHover={{ scale: sprite.size * 1.1 }}
      whileTap={{ scale: sprite.size * 0.95 }}
    >
      <div className={`${screenSize.isMobile ? 'text-2xl' : 'text-4xl'} drop-shadow-lg filter hover:brightness-110 transition-all`}>
        {ANIMALS_LIST[sprite.animalType] || '🎯'}
      </div>
      
      {/* Enhanced remove button */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(sprite.id);
        }}
        disabled={isPlaying}
        className={`absolute -top-1 -right-1 ${screenSize.isMobile ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'} bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center shadow-lg font-bold border-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-200`}
        whileHover={isPlaying ? {} : { scale: 1.2, rotate: 90 }}
        whileTap={isPlaying ? {} : { scale: 0.9 }}
      >
        ×
      </motion.button>

      {sprite.speech && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 10 }}
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 ${screenSize.isMobile ? 'text-xs' : 'text-sm'} rounded-xl whitespace-nowrap shadow-xl border ${screenSize.isMobile ? 'max-w-32' : 'max-w-48'} ${
            sprite.speechType === 'think' 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300' 
              : 'bg-gradient-to-r from-white to-blue-50 text-gray-800 border-gray-200'
          }`}
        >
          {sprite.speechType === 'think' && '💭 '}
          <span className="font-medium">{sprite.speech}</span>
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
            sprite.speechType === 'think' ? 'border-t-4 border-t-blue-500' : 'border-t-4 border-t-white'
          }`}></div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Enhanced Stage Component
const Stage = ({ sprites, selectedSpriteId, onSpriteSelect, onSpriteMove, onSpriteRemove, stageWidth, stageHeight, isPlaying, screenSize }) => {
  return (
    <div 
      className="stage-container relative w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 border-3 border-blue-300 rounded-2xl overflow-hidden shadow-xl"
      style={{ width: stageWidth, height: stageHeight, minWidth: stageWidth, minHeight: stageHeight }}
    >
      {/* Responsive stage boundary indicator */}
      <div className="absolute inset-2 border-2 border-dashed border-blue-300/50 rounded-xl pointer-events-none"></div>
      
      {/* Enhanced animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute top-4 left-4 ${screenSize.isMobile ? 'w-4 h-4' : 'w-6 h-6'} bg-yellow-300 rounded-full animate-bounce`}></div>
        <div className={`absolute top-8 right-8 ${screenSize.isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-pink-300 rounded-full animate-ping`}></div>
        <div className={`absolute bottom-6 left-8 ${screenSize.isMobile ? 'w-2 h-2' : 'w-3 h-3'} bg-green-300 rounded-full animate-pulse`}></div>
      </div>
      
      <AnimatePresence>
        {sprites.map((sprite) => (
          <Sprite
            key={sprite.id}
            sprite={sprite}
            isSelected={selectedSpriteId === sprite.id}
            onSelect={onSpriteSelect}
            onMove={onSpriteMove}
            onRemove={onSpriteRemove}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
            isPlaying={isPlaying}
            screenSize={screenSize}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Playback Controls
const PlaybackControls = ({ 
  onRemoveSprite, 
  selectedSpriteId, 
  sprites, 
  spriteActions,
  playForAll,
  setPlayForAll,
  autoExecute,
  setAutoExecute,
  isPlaying,
  screenSize
}) => {
  const selectedSprite = sprites.find(s => s.id === selectedSpriteId);

  return (
    <div className="space-y-4">
      {/* Auto Execution Toggle */}
      <motion.div 
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={autoExecute}
            onChange={(e) => setAutoExecute(e.target.checked)}
            disabled={isPlaying}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2"
          />
          <span className="text-gray-700 font-semibold">🤖 Instant Magic Mode</span>
        </label>
        <p className={`text-gray-600 mt-2 ml-7 ${screenSize.isMobile ? 'text-xs' : 'text-xs'}`}>
          Actions happen right away when you add them
        </p>
      </motion.div>

      {/* Play Mode Toggle */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={playForAll}
            onChange={(e) => setPlayForAll(e.target.checked)}
            disabled={isPlaying}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-gray-700 font-semibold">🎭 Show Time for Everyone</span>
        </label>
      </motion.div>

      {/* Hero Feature Info */}
      <motion.div 
        className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 shadow-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className={`text-orange-700 mb-2 font-semibold flex items-center gap-2 ${screenSize.isMobile ? 'text-sm' : 'text-sm'}`}>
          ⭐ MAGICAL COLLISION SWAPS
        </div>
        <div className={`text-orange-600 ${screenSize.isMobile ? 'text-xs' : 'text-xs'}`}>
          When two friends bump into each other, they magically swap all their actions! It's like they're trading their to-do lists!
        </div>
      </motion.div>

      {/* FIXED: Step Explanation */}
      <motion.div 
        className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-4 shadow-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className={`text-cyan-700 mb-2 font-semibold flex items-center gap-2 ${screenSize.isMobile ? 'text-sm' : 'text-sm'}`}>
          📏 HOW STEPS WORK
        </div>
        <div className={`text-cyan-600 ${screenSize.isMobile ? 'text-xs' : 'text-xs'}`}>
          • 1 step = 1 pixel of movement<br/>
          • 50 steps = character moves 50 pixels<br/>
          • Bigger numbers = longer distances<br/>
          • Repeat uses your LAST 2 actions!
        </div>
      </motion.div>

      {/* Selected Sprite Info */}
      {selectedSprite && (
        <motion.div 
          className="bg-gradient-to-r from-white to-blue-50 border-2 border-gray-200 rounded-xl p-4 shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className={`text-gray-600 mb-3 font-medium ${screenSize.isMobile ? 'text-sm' : 'text-sm'}`}>Currently Directing</div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className={`text-gray-800 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${screenSize.isMobile ? 'text-base' : 'text-lg'}`}>
                {selectedSprite.name}
              </span>
              <div className={`mt-1 ${screenSize.isMobile ? 'text-xs' : 'text-sm'}`}>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {spriteActions[selectedSpriteId]?.length || 0} actions ready
                </span>
              </div>
            </div>
            <motion.button
              onClick={() => onRemoveSprite(selectedSpriteId)}
              disabled={isPlaying}
              className={`bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg transition-all flex-shrink-0 ${screenSize.isMobile ? 'text-xs' : 'text-sm'}`}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              Say Goodbye
            </motion.button>
          </div>
        </motion.div>
      )}
      
      {/* Status Info */}
      <motion.div 
        className={`bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 shadow-sm ${screenSize.isMobile ? 'text-sm' : 'text-sm'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-gray-600 font-medium">
          {autoExecute 
            ? `🤖 Instant mode: Actions happen like magic!`
            : playForAll 
              ? `🎪 Show time for everyone with actions (${Object.keys(spriteActions).filter(id => spriteActions[id]?.length > 0).length} stars ready)`
              : selectedSpriteId 
                ? `🎯 Spotlight on ${selectedSprite?.name}`
                : '⚠️ Pick a character to start the show'
          }
        </div>
      </motion.div>
    </div>
  );
};

// Enhanced Collision Detection Hook
const useCollisionDetection = (sprites, onCollision) => {
  useEffect(() => {
    const checkCollisions = () => {
      for (let i = 0; i < sprites.length; i++) {
        for (let j = i + 1; j < sprites.length; j++) {
          const sprite1 = sprites[i];
          const sprite2 = sprites[j];
          
          const distance = Math.sqrt(
            Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2)
          );
          
          if (distance < 50 && !sprite1.hasCollided && !sprite2.hasCollided) {
            onCollision(sprite1.id, sprite2.id);
          }
        }
      }
    };

    const interval = setInterval(checkCollisions, 100);
    return () => clearInterval(interval);
  }, [sprites, onCollision]);
};

// FIXED: Main Component with all hooks at top level
function ScratchCloneMain() {
  // FIXED: Always call hooks at the top level - no conditional calls
  const screenSize = useResponsive();
  const stageSize = useStageSize(screenSize);
  
  const [sprites, setSprites] = useState([]);
  const [selectedSpriteId, setSelectedSpriteId] = useState(null);
  const [spriteIdCounter, setSpriteIdCounter] = useState(1);
  const [spriteActionQueues, setSpriteActionQueues] = useState({});
  const [currentlyExecutingActions, setCurrentlyExecutingActions] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [playForAll, setPlayForAll] = useState(true);
  const [autoExecute, setAutoExecute] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [randomAnimal, setRandomAnimal] = useState(null);
  const [showSpriteLibrary, setShowSpriteLibrary] = useState(false);
  const [collisionCooldowns, setCollisionCooldowns] = useState(new Set());
  
  const playbackRef = useRef(null);

  const addDebugLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-4), `[${timestamp}] ${message}`]);
  }, []);

  const getRandomAnimal = useCallback(() => {
    const animalTypes = Object.keys(ANIMALS_LIST);
    const randomType = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    return {
      type: randomType,
      emoji: ANIMALS_LIST[randomType]
    };
  }, []);

  const handleAddRandomAnimal = useCallback(() => {
    if (isPlaying) return;
    const animal = getRandomAnimal();
    setRandomAnimal(animal);
    setShowNamePopup(true);
  }, [isPlaying, getRandomAnimal]);

  const handleAddRandomAnimalFromOverlay = useCallback(() => {
    if (isPlaying) return;
    setShowSpriteLibrary(false);
    const animal = getRandomAnimal();
    setRandomAnimal(animal);
    setShowNamePopup(true);
  }, [isPlaying, getRandomAnimal]);

  const handlePopupConfirm = useCallback((customName) => {
    const newSprite = {
      id: spriteIdCounter,
      name: customName,
      animalType: randomAnimal.type,
      x: Math.random() * (stageSize.width - 100) + 50,
      y: Math.random() * (stageSize.height - 100) + 50,
      rotation: 0,
      size: 1,
      visible: true,
      speech: '',
      speechType: '',
      hasCollided: false,
    };
    setSprites(prev => [...prev, newSprite]);
    setSpriteIdCounter(prev => prev + 1);
    setSelectedSpriteId(newSprite.id);
    addDebugLog(`🌟 Welcome ${customName} the ${randomAnimal.type}!`);
    setShowNamePopup(false);
    setRandomAnimal(null);
  }, [spriteIdCounter, randomAnimal, stageSize.width, stageSize.height, addDebugLog]);

  const handlePopupClose = useCallback(() => {
    setShowNamePopup(false);
    setRandomAnimal(null);
  }, []);

  const availableSprites = [
    { name: 'Cat', emoji: '🐱', color: 'from-orange-400 to-red-500' },
    { name: 'Dog', emoji: '🐶', color: 'from-amber-400 to-orange-500' },
    { name: 'Lion', emoji: '🦁', color: 'from-yellow-400 to-orange-500' },
    { name: 'Tiger', emoji: '🐅', color: 'from-orange-500 to-red-600' },
    { name: 'Bear', emoji: '🐻', color: 'from-amber-600 to-brown-700' },
    { name: 'Fox', emoji: '🦊', color: 'from-orange-400 to-red-500' },
    { name: 'Monkey', emoji: '🐵', color: 'from-yellow-500 to-orange-600' },
    { name: 'Elephant', emoji: '🐘', color: 'from-gray-400 to-gray-600' }
  ];

  const handleCollision = useCallback((sprite1Id, sprite2Id) => {
    const collisionKey = [sprite1Id, sprite2Id].sort().join('-');
    
    if (collisionCooldowns.has(collisionKey)) {
      return;
    }

    const sprite1 = sprites.find(s => s.id === sprite1Id);
    const sprite2 = sprites.find(s => s.id === sprite2Id);
    
    if (!sprite1 || !sprite2) {
      return;
    }

    const sprite1Name = sprite1.name || `Friend${sprite1Id}`;
    const sprite2Name = sprite2.name || `Friend${sprite2Id}`;

    setCollisionCooldowns(prev => new Set([...prev, collisionKey]));

    addDebugLog(`💥 BUMP! ${sprite1Name} and ${sprite2Name} collided!`);
    addDebugLog(`🎭 MAGICAL SWAP! They're trading action lists!`);

    setSpriteActionQueues(prev => {
      const sprite1Actions = [...(prev[sprite1Id] || [])];
      const sprite2Actions = [...(prev[sprite2Id] || [])];
      
      addDebugLog(`📝 ${sprite1Name} had: ${sprite1Actions.length} actions`);
      addDebugLog(`📝 ${sprite2Name} had: ${sprite2Actions.length} actions`);
      addDebugLog(`🔄 Action swap complete! The magic worked!`);
      
      return {
        ...prev,
        [sprite1Id]: sprite2Actions,
        [sprite2Id]: sprite1Actions
      };
    });

    setSprites(prevSprites =>
      prevSprites.map(sprite => {
        if (sprite.id === sprite1Id) {
          return {
            ...sprite,
            hasCollided: true,
            speech: `Got ${sprite2Name}'s moves! ✨`,
            speechType: 'say'
          };
        }
        if (sprite.id === sprite2Id) {
          return {
            ...sprite,
            hasCollided: true,
            speech: `Got ${sprite1Name}'s moves! ✨`,
            speechType: 'say'
          };
        }
        return sprite;
      })
    );

    setTimeout(() => {
      setSprites(prevSprites =>
        prevSprites.map(sprite => {
          if (sprite.id === sprite1Id || sprite.id === sprite2Id) {
            return {
              ...sprite,
              hasCollided: false,
              speech: '',
              speechType: ''
            };
          }
          return sprite;
        })
      );
      
      setTimeout(() => {
        setCollisionCooldowns(prev => {
          const newSet = new Set(prev);
          newSet.delete(collisionKey);
          return newSet;
        });
      }, 2000);
      
    }, 2000);

  }, [sprites, addDebugLog, collisionCooldowns]);

  useCollisionDetection(sprites, handleCollision);

  const handleAddAction = useCallback(async (action, spriteId, shouldAutoExecute = false) => {
    if (isPlaying) return;
    
    if (!spriteId) {
      addDebugLog(`⚠️ Please pick a character first!`);
      return;
    }
    
    const sprite = sprites.find(s => s.id === spriteId);
    const spriteName = sprite?.name || `Friend${spriteId}`;
    
    setSpriteActionQueues(prev => {
      const currentActions = prev[spriteId] || [];
      const newActions = [...currentActions, action];
      
      const actionDisplay = typeof action === 'string' ? action : 
        action.type === 'moveSteps' ? `Walk ${action.steps} pixels` :
        action.type === 'turnDegrees' ? `Spin ${action.degrees}°` :
        action.type === 'goToXY' ? `Jump to (${action.x}, ${action.y})` :
        action.type === 'sayFor' ? `Say "${action.text}" for ${action.seconds}s` :
        action.type === 'thinkFor' ? `Think "${action.text}" for ${action.seconds}s` :
        action.type === 'repeat' ? `Repeat ${action.times} times` :
        JSON.stringify(action);
      
      addDebugLog(`➕ Added "${actionDisplay}" to ${spriteName}${shouldAutoExecute ? ' (INSTANT)' : ''}`);
      
      return {
        ...prev,
        [spriteId]: newActions
      };
    });

    if (shouldAutoExecute && sprite) {
      addDebugLog(`🤖 Instant magic for ${spriteName}!`);
      setTimeout(async () => {
        await executeAction(sprite, action, setSprites, stageSize.width, stageSize.height);
      }, 100);
    }
  }, [isPlaying, sprites, stageSize.width, stageSize.height, addDebugLog]);

  const handleSpriteMove = useCallback((spriteId, x, y) => {
    if (isPlaying) return;
    setSprites(prevSprites => 
      prevSprites.map(sprite => 
        sprite.id === spriteId ? { ...sprite, x, y } : sprite
      )
    );
  }, [isPlaying]);

  const handleAddSprite = useCallback((spriteData) => {
    const spriteType = typeof spriteData === 'string' ? spriteData : spriteData.name;
    const existingSprite = sprites.find(sprite => sprite.animalType === spriteType);
    if (existingSprite) {
      addDebugLog(`🎯 ${existingSprite.name} is now in the spotlight!`);
      setSelectedSpriteId(existingSprite.id);
      return;
    }

    const newSprite = {
      id: spriteIdCounter,
      name: spriteType,
      animalType: spriteType,
      x: Math.random() * (stageSize.width - 100) + 50,
      y: Math.random() * (stageSize.height - 100) + 50,
      rotation: 0,
      size: 1,
      visible: true,
      speech: '',
      speechType: '',
      hasCollided: false,
    };
    setSprites(prev => [...prev, newSprite]);
    setSpriteIdCounter(prev => prev + 1);
    setSelectedSpriteId(newSprite.id);
    addDebugLog(`🌟 Welcome ${spriteType} to the stage!`);
  }, [sprites, spriteIdCounter, stageSize.width, stageSize.height, addDebugLog]);

  const handleSpriteSelect = useCallback((spriteId) => {
    if (!isPlaying) {
      if (selectedSpriteId === spriteId) {
        setSelectedSpriteId(null);
        addDebugLog(`🔍 No character selected`);
      } else {
        setSelectedSpriteId(spriteId);
        const sprite = sprites.find(s => s.id === spriteId);
        addDebugLog(`🎯 Now directing ${sprite?.name || 'character'}`);
      }
    }
  }, [isPlaying, selectedSpriteId, sprites, addDebugLog]);

  const handleRemoveSprite = useCallback((spriteId) => {
    if (isPlaying) return;
    
    const sprite = sprites.find(s => s.id === spriteId);
    addDebugLog(`👋 ${sprite?.name || 'Character'} has left the stage`);
    
    setSprites(prev => prev.filter(sprite => sprite.id !== spriteId));
    setSpriteActionQueues(prev => {
      const newQueues = { ...prev };
      delete newQueues[spriteId];
      return newQueues;
    });
    
    if (selectedSpriteId === spriteId) {
      setSelectedSpriteId(null);
    }
  }, [isPlaying, sprites, selectedSpriteId, addDebugLog]);

  const handleRemoveAction = useCallback((spriteId, actionIndex) => {
    if (isPlaying) return;
    setSpriteActionQueues(prev => {
      const currentActions = prev[spriteId] || [];
      const sprite = sprites.find(s => s.id === spriteId);
      addDebugLog(`➖ Removed action from ${sprite?.name || 'character'}`);
      
      return {
        ...prev,
        [spriteId]: currentActions.filter((_, index) => index !== actionIndex)
      };
    });
  }, [isPlaying, sprites, addDebugLog]);

  const handleClearAllActions = useCallback((spriteId) => {
    if (isPlaying) return;
    const sprite = sprites.find(s => s.id === spriteId);
    addDebugLog(`🧹 Cleared all actions for ${sprite?.name || 'character'}`);
    
    setSpriteActionQueues(prev => ({
      ...prev,
      [spriteId]: []
    }));
  }, [isPlaying, sprites, addDebugLog]);

  const executeActionsSequentially = useCallback(async (spriteId, actions) => {
    let remainingActions = [...actions];
    setCurrentlyExecutingActions(prev => ({
      ...prev,
      [spriteId]: remainingActions
    }));

    const sprite = sprites.find(s => s.id === spriteId);
    const spriteName = sprite?.name || `Friend${spriteId}`;
    
    for (let i = 0; i < actions.length; i++) {
      if (!playbackRef.current) {
        addDebugLog(`⏸️ Show paused for ${spriteName}`);
        break;
      }
      
      const action = remainingActions[0];
      if (!action) break;
      
      addDebugLog(`🎬 ${spriteName}: Action ${i + 1}/${actions.length}`);
      
      const currentSprite = sprites.find(s => s.id === spriteId);
      if (currentSprite) {
        await executeAction(currentSprite, action, setSprites, stageSize.width, stageSize.height);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setCurrentlyExecutingActions(prev => {
          const newRemaining = (prev[spriteId] || []).slice(1);
          return {
            ...prev,
            [spriteId]: newRemaining
          };
        });
        
        remainingActions = remainingActions.slice(1);
      } else {
        addDebugLog(`❌ ${spriteName} disappeared from stage`);
        break;
      }
    }

    setCurrentlyExecutingActions(prev => {
      const newState = { ...prev };
      delete newState[spriteId];
      return newState;
    });
    addDebugLog(`✅ ${spriteName} finished their performance!`);
  }, [sprites, stageSize.width, stageSize.height, addDebugLog]);

  const handlePlay = useCallback(async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    playbackRef.current = true;
    addDebugLog(`🎬 Show time! (Magical swaps ready)...`);
    
    try {
      if (playForAll) {
        const activeSprites = Object.keys(spriteActionQueues).filter(id => {
          const actions = spriteActionQueues[id];
          return actions && Array.isArray(actions) && actions.length > 0;
        });
        
        if (activeSprites.length === 0) {
          addDebugLog(`⚠️ No characters have actions to perform`);
          setIsPlaying(false);
          playbackRef.current = null;
          return;
        }

        const promises = activeSprites.map(spriteId => {
          const id = parseInt(spriteId);
          return executeActionsSequentially(id, spriteActionQueues[id]);
        });
        
        await Promise.all(promises);
        
      } else {
        if (!selectedSpriteId) {
          addDebugLog(`⚠️ No character selected for solo performance`);
          setIsPlaying(false);
          playbackRef.current = null;
          return;
        }

        const selectedActions = spriteActionQueues[selectedSpriteId];
        if (!selectedActions || selectedActions.length === 0) {
          addDebugLog(`⚠️ Selected character has no actions to perform`);
          setIsPlaying(false);
          playbackRef.current = null;
          return;
        }

        await executeActionsSequentially(selectedSpriteId, selectedActions);
      }
      
    } catch (error) {
      addDebugLog(`💥 Something went wrong: ${error.message}`);
    } finally {
      setIsPlaying(false);
      playbackRef.current = null;
      setCurrentlyExecutingActions({});
      addDebugLog(`🏁 Show complete! Watch for magical collisions!`);
    }
  }, [isPlaying, playForAll, spriteActionQueues, selectedSpriteId, executeActionsSequentially, addDebugLog]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    playbackRef.current = null;
    addDebugLog(`⏸️ Show paused`);
  }, [addDebugLog]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    playbackRef.current = null;
    setCurrentlyExecutingActions({});
    setSprites(prev => prev.map(sprite => ({
      ...sprite,
      speech: '',
      speechType: '',
      hasCollided: false,
      size: 1
    })));
    addDebugLog(`⏹️ Show stopped and characters reset`);
  }, [addDebugLog]);

  const handleClearAll = useCallback(() => {
    addDebugLog(`🧹 Starting fresh...`);
    
    setSprites([]);
    setSpriteActionQueues({});
    setCurrentlyExecutingActions({});
    setSelectedSpriteId(null);
    setSpriteIdCounter(1);
    setIsPlaying(false);
    setPlayForAll(true);
    setAutoExecute(false);
    
    if (playbackRef.current) {
      playbackRef.current = null;
    }
    
    setTimeout(() => {
      setDebugLogs(['🚀 Welcome to Scratch Clone Pro! Ready for magical adventures!']);
    }, 500);
  }, [addDebugLog]);

  const createDemoShow = useCallback(() => {
    setSprites([]);
    setSpriteActionQueues({});
    setSelectedSpriteId(null);
    
    const character1 = {
      id: 1,
      name: 'Whiskers',
      animalType: 'Cat',
      x: 80,
      y: stageSize.height / 2,
      rotation: 0,
      size: 1,
      visible: true,
      speech: '',
      speechType: '',
      hasCollided: false,
    };
    
    const character2 = {
      id: 2,
      name: 'Buddy',
      animalType: 'Dog',
      x: stageSize.width - 80,
      y: stageSize.height / 2,
      rotation: 0,
      size: 1,
      visible: true,
      speech: '',
      speechType: '',
      hasCollided: false,
    };
    
    setSprites([character1, character2]);
    
    setSpriteActionQueues({
      [character1.id]: [
        { type: 'moveSteps', steps: 15 },
        { type: 'repeat', times: 10, actions: [{ type: 'moveSteps', steps: 15 }] }
      ],
      [character2.id]: [
        { type: 'moveSteps', steps: -15 },
        { type: 'repeat', times: 10, actions: [{ type: 'moveSteps', steps: -15 }] }
      ]
    });
    
    setSpriteIdCounter(3);
    setSelectedSpriteId(character1.id);
    setPlayForAll(true);
    
    addDebugLog('🎭 MAGICAL DEMO: Collision Swap Challenge!');
    addDebugLog('Whiskers (Cat): Walk right 15 pixels + repeat 10 times');
    addDebugLog('Buddy (Dog): Walk left 15 pixels + repeat 10 times');
    addDebugLog('💥 When they bump: COMPLETE ACTION SWAP!');
    addDebugLog('🚀 Hit PLAY to see the magic happen!');
  }, [stageSize.width, stageSize.height, addDebugLog]);

  // Only render after client-side hydration to prevent SSR mismatch
  if (!screenSize.isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-blue-600">🎭 Loading Scratch Clone Pro...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Enhanced Responsive Header */}
        <motion.header 
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-4 lg:p-6 shadow-2xl"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Mobile Layout */}
            {screenSize.isMobile && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div 
                      className="text-2xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      🎭
                    </motion.div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                        Scratch Clone Pro
                      </h1>
                      <p className="text-xs text-blue-100">
                        Magical Collision Swaps + Pixel-Perfect Steps
                      </p>
                    </div>
                  </motion.div>
                </div>
                
                {/* Mobile Controls Row */}
                <div className="flex items-center justify-between gap-2">
                  <motion.button
                    onClick={() => setShowSpriteLibrary(true)}
                    disabled={isPlaying}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white px-3 py-2 rounded-lg shadow-lg transition-all text-xs font-medium flex items-center gap-2"
                    whileHover={!isPlaying ? { scale: 1.05 } : {}}
                  >
                    <span>🎯</span>
                    <span>Add Friend</span>
                  </motion.button>

                  <div className="flex gap-2">
                    {!isPlaying && (
                      <motion.button
                        onClick={handlePlay}
                        disabled={(!playForAll && !selectedSpriteId) || (!playForAll && selectedSpriteId && (!spriteActionQueues[selectedSpriteId] || spriteActionQueues[selectedSpriteId].length === 0)) || (playForAll && !Object.values(spriteActionQueues).some(actions => actions?.length > 0))}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        ▶️
                      </motion.button>
                    )}

                    {isPlaying && (
                      <motion.button
                        onClick={handleStop}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        ⏹️
                      </motion.button>
                    )}

                    {!isPlaying && (
                      <motion.button
                        onClick={createDemoShow}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-2 rounded-lg font-semibold text-xs shadow-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                      >
                        🎭
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tablet/Desktop Layout */}
            {!screenSize.isMobile && (
              <div className="flex items-center justify-between gap-6">
                <motion.div 
                  className="flex items-center gap-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className="text-4xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🎭
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                      Scratch Clone Pro
                    </h1>
                    <p className="text-sm text-blue-100 mt-1">
                      Pixel-Perfect Movement + Complete Action Swap on Collision
                    </p>
                  </div>
                </motion.div>

                <motion.button
                  onClick={() => setShowSpriteLibrary(true)}
                  disabled={isPlaying}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-white px-10 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
                  whileHover={!isPlaying ? { scale: 1.05 } : {}}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <span className="text-lg">🎯</span>
                  <span className="text-sm font-medium">Add Character</span>
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {!isPlaying && (
                      <motion.button
                        onClick={handlePlay}
                        disabled={(!playForAll && !selectedSpriteId) || (!playForAll && selectedSpriteId && (!spriteActionQueues[selectedSpriteId] || spriteActionQueues[selectedSpriteId].length === 0)) || (playForAll && !Object.values(spriteActionQueues).some(actions => actions?.length > 0))}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        ▶️ Play
                      </motion.button>
                    )}

                    {isPlaying && (
                      <>
                        <motion.button
                          onClick={handlePause}
                          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg"
                          whileHover={{ scale: 1.05 }}
                        >
                          ⏸️ Pause
                        </motion.button>
                        
                        <motion.button
                          onClick={handleStop}
                          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg"
                          whileHover={{ scale: 1.05 }}
                        >
                          ⏹️ Stop
                        </motion.button>
                      </>
                    )}
                  </div>
                  
                  {!isPlaying && (
                    <div className="flex gap-2">
                      <motion.button
                        onClick={createDemoShow}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                      >
                        🎭 Demo
                      </motion.button>
                      <motion.button
                        onClick={handleClearAll}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                      >
                        🧹 Clear
                      </motion.button>
                    </div>
                  )}

                  {isPlaying && (
                    <motion.div 
                      className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Playing...</span>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.header>

        {/* Responsive Main Content */}
        <div className="max-w-8xl mx-auto p-4 lg:p-6">
          {screenSize.isMobile ? (
            // Mobile Layout - Stacked
            <div className="space-y-6">
              {/* Stage First on Mobile */}
              <motion.div 
                className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <motion.h3 
                  className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xl">🎪</span> Stage
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-normal">
                    {sprites.length} friend{sprites.length !== 1 ? 's' : ''}
                  </span>
                </motion.h3>
                
                <div className="flex items-center justify-center mb-4">
                  <Stage
                    sprites={sprites}
                    selectedSpriteId={selectedSpriteId}
                    onSpriteSelect={handleSpriteSelect}
                    onSpriteMove={handleSpriteMove}
                    onSpriteRemove={handleRemoveSprite}
                    stageWidth={stageSize.width}
                    stageHeight={stageSize.height}
                    isPlaying={isPlaying}
                    screenSize={screenSize}
                  />
                </div>
                
                {/* Debug Logs for Mobile */}
                {debugLogs.length > 0 && (
                  <motion.div 
                    className="bg-gray-900 text-green-400 p-3 rounded-xl font-mono text-xs leading-relaxed max-h-32 overflow-y-auto shadow-inner"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-gray-500 mb-2 font-semibold text-xs">🔍 Activity Log:</div>
                    {debugLogs.slice(-3).map((log, index) => (
                      <motion.div 
                        key={index}
                        className="mb-1 text-xs"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {log}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Code Area */}
              <motion.div 
                className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.h3 
                  className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-xl">📝</span> Actions
                </motion.h3>
                
                <CodeArea
                  spriteActions={spriteActionQueues}
                  selectedSpriteId={selectedSpriteId}
                  sprites={sprites}
                  onAddAction={handleAddAction}
                  onRemoveAction={handleRemoveAction}
                  onClearAllActions={handleClearAllActions}
                  isPlaying={isPlaying}
                  autoExecute={autoExecute}
                  screenSize={screenSize}
                />
              </motion.div>

              {/* Blocks Palette */}
              <motion.div 
                className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.h3 
                  className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-xl">🧩</span> Action Blocks
                </motion.h3>
                
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="text-base font-semibold mb-3 text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🚀</span> Movement
                    </h4>
                    <MotionBlocks isPlaying={isPlaying} screenSize={screenSize} />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h4 className="text-base font-semibold mb-3 text-gray-700 flex items-center gap-2">
                      <span className="text-lg">💭</span> Speech
                    </h4>
                    <LooksBlocks isPlaying={isPlaying} screenSize={screenSize} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Controls */}
              <motion.div 
                className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <motion.h3 
                  className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-xl">🎮</span> Settings
                </motion.h3>
                
                <PlaybackControls
                  onRemoveSprite={handleRemoveSprite}
                  selectedSpriteId={selectedSpriteId}
                  sprites={sprites}
                  spriteActions={spriteActionQueues}
                  playForAll={playForAll}
                  setPlayForAll={setPlayForAll}
                  autoExecute={autoExecute}
                  setAutoExecute={setAutoExecute}
                  isPlaying={isPlaying}
                  screenSize={screenSize}
                />
              </motion.div>
            </div>
          ) : (
            // Desktop/Tablet Layout - Grid
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar: Blocks Palette */}
              <motion.div 
                className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.h3 
                  className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-2xl">🧩</span> Action Blocks
                </motion.h3>
                
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h4 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                      <span className="text-xl">🚀</span> Movement
                    </h4>
                    <MotionBlocks isPlaying={isPlaying} screenSize={screenSize} />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                      <span className="text-xl">💭</span> Speech & Thoughts
                    </h4>
                    <LooksBlocks isPlaying={isPlaying} screenSize={screenSize} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Center: Stage */}
              <motion.div 
                className="lg:col-span-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.h3 
                  className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-2xl">🎪</span> Stage
                  <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-normal">
                    {sprites.length} character{sprites.length !== 1 ? 's' : ''}
                  </span>
                </motion.h3>
                
                <div className="flex items-center justify-center mb-6">
                  <Stage
                    sprites={sprites}
                    selectedSpriteId={selectedSpriteId}
                    onSpriteSelect={handleSpriteSelect}
                    onSpriteMove={handleSpriteMove}
                    onSpriteRemove={handleRemoveSprite}
                    stageWidth={stageSize.width}
                    stageHeight={stageSize.height}
                    isPlaying={isPlaying}
                    screenSize={screenSize}
                  />
                </div>
                
                {/* Enhanced Debug Logs */}
                {debugLogs.length > 0 && (
                  <motion.div 
                    className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs leading-relaxed max-h-40 overflow-y-auto shadow-inner"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-gray-500 mb-2 font-semibold">🔍 Activity Console:</div>
                    {debugLogs.map((log, index) => (
                      <motion.div 
                        key={index}
                        className="mb-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {log}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Right Sidebar: Code Area + Controls */}
              <motion.div 
                className="lg:col-span-3 space-y-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {/* Code Area */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <motion.h3 
                    className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="text-2xl">📝</span> Action Sequence
                  </motion.h3>
                  
                  <CodeArea
                    spriteActions={spriteActionQueues}
                    selectedSpriteId={selectedSpriteId}
                    sprites={sprites}
                    onAddAction={handleAddAction}
                    onRemoveAction={handleRemoveAction}
                    onClearAllActions={handleClearAllActions}
                    isPlaying={isPlaying}
                    autoExecute={autoExecute}
                    screenSize={screenSize}
                  />
                </div>
                
                {/* Controls */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <motion.h3 
                    className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-2xl">🎮</span> Director Controls
                  </motion.h3>
                  
                  <PlaybackControls
                    onRemoveSprite={handleRemoveSprite}
                    selectedSpriteId={selectedSpriteId}
                    sprites={sprites}
                    spriteActions={spriteActionQueues}
                    playForAll={playForAll}
                    setPlayForAll={setPlayForAll}
                    autoExecute={autoExecute}
                    setAutoExecute={setAutoExecute}
                    isPlaying={isPlaying}
                    screenSize={screenSize}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Sprite Library Overlay */}
        <AnimatePresence>
          {showSpriteLibrary && (
            <SpriteLibraryOverlay
              isOpen={showSpriteLibrary}
              onClose={() => setShowSpriteLibrary(false)}
              onAddSprite={(sprite) => {
                setShowSpriteLibrary(false);
                handleAddSprite(sprite);
              }}
              onAddRandomAnimal={handleAddRandomAnimalFromOverlay}
              isPlaying={isPlaying}
              availableSprites={availableSprites}
              screenSize={screenSize}
            />
          )}
        </AnimatePresence>

        {/* Animal Name Popup */}
        <AnimatePresence>
          {showNamePopup && (
            <AnimalNamePopup
              isOpen={showNamePopup}
              onClose={handlePopupClose}
              onConfirm={handlePopupConfirm}
              randomAnimal={randomAnimal}
              screenSize={screenSize}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}

export default ScratchCloneMain;




// 'use client'

// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';

// // Static Animals List
// const ANIMALS_LIST = {
//   'Cat': '🐱',
//   'Dog': '🐶', 
//   'Lion': '🦁',
//   'Tiger': '🐅',
//   'Bear': '🐻',
//   'Fox': '🦊',
//   'Wolf': '🐺',
//   'Panda': '🐼',
//   'Monkey': '🐵',
//   'Elephant': '🐘',
//   'Rabbit': '🐰',
//   'Horse': '🐴',
//   'Cow': '🐄',
//   'Pig': '🐷',
//   'Sheep': '🐑',
//   'Chicken': '🐔',
//   'Duck': '🦆',
//   'Penguin': '🐧',
//   'Fish': '🐟',
//   'Butterfly': '🦋'
// };

// // Enhanced Sprite Actions Implementation with Repeat
// const spriteActions = {
//   // Motion actions
//   moveSteps: (steps) => ({ type: 'moveSteps', steps }),
//   turnDegrees: (degrees) => ({ type: 'turnDegrees', degrees }),
//   goToXY: (x, y) => ({ type: 'goToXY', x, y }),
//   repeat: (actions, times) => ({ type: 'repeat', actions, times }),
  
//   // Looks actions
//   sayFor: (text, seconds) => ({ type: 'sayFor', text, seconds }),
//   thinkFor: (text, seconds) => ({ type: 'thinkFor', text, seconds }),
  
//   // Predefined actions for easy use
//   moveRight: { type: 'moveSteps', steps: 30 },
//   moveLeft: { type: 'moveSteps', steps: -30 },
//   moveUp: { type: 'moveSteps', steps: 30, direction: 'up' },
//   moveDown: { type: 'moveSteps', steps: 30, direction: 'down' },
//   spin360: { type: 'turnDegrees', degrees: 360 },
//   sayHello: { type: 'sayFor', text: 'Hello!', seconds: 2 },
//   thinkHmm: { type: 'thinkFor', text: 'Hmm...', seconds: 2 }
// };

// const executeAction = async (sprite, action, setSprites, stageWidth, stageHeight) => {
//   return new Promise((resolve) => {
//     if (typeof action === 'string') {
//       action = spriteActions[action];
//     }

//     switch (action.type) {
//       case 'repeat':
//         // Handle repeat action by executing nested actions multiple times
//         const executeRepeat = async () => {
//           for (let i = 0; i < action.times; i++) {
//             for (const nestedAction of action.actions) {
//               await executeAction(sprite, nestedAction, setSprites, stageWidth, stageHeight);
//               await new Promise(resolve => setTimeout(resolve, 200));
//             }
//           }
//           resolve();
//         };
//         executeRepeat();
//         break;
        
//       case 'moveSteps':
//         setSprites(prevSprites => 
//           prevSprites.map(s => {
//             if (s.id === sprite.id) {
//               const radians = (s.rotation * Math.PI) / 180;
//               let newX = s.x;
//               let newY = s.y;
              
//               if (action.direction === 'up') {
//                 newY = Math.max(30, Math.min(stageHeight - 30, s.y - action.steps));
//               } else if (action.direction === 'down') {
//                 newY = Math.max(30, Math.min(stageHeight - 30, s.y + action.steps));
//               } else {
//                 newX = Math.max(30, Math.min(stageWidth - 30, s.x + action.steps * Math.cos(radians)));
//                 newY = Math.max(30, Math.min(stageHeight - 30, s.y + action.steps * Math.sin(radians)));
//               }
              
//               return { ...s, x: newX, y: newY };
//             }
//             return s;
//           })
//         );
//         setTimeout(resolve, 500);
//         break;
        
//       case 'turnDegrees':
//         setSprites(prevSprites => 
//           prevSprites.map(s => 
//             s.id === sprite.id 
//               ? { ...s, rotation: s.rotation + action.degrees }
//               : s
//           )
//         );
//         setTimeout(resolve, 300);
//         break;
        
//       case 'goToXY':
//         setSprites(prevSprites => 
//           prevSprites.map(s => 
//             s.id === sprite.id 
//               ? { ...s, x: Math.max(30, Math.min(stageWidth - 30, action.x)), y: Math.max(30, Math.min(stageHeight - 30, action.y)) }
//               : s
//           )
//         );
//         setTimeout(resolve, 500);
//         break;
        
//       case 'sayFor':
//         setSprites(prevSprites => 
//           prevSprites.map(s => 
//             s.id === sprite.id 
//               ? { ...s, speech: action.text, speechType: 'say' }
//               : s
//           )
//         );
//         setTimeout(() => {
//           setSprites(prevSprites => 
//             prevSprites.map(s => 
//               s.id === sprite.id 
//                 ? { ...s, speech: '', speechType: '' }
//                 : s
//             )
//           );
//           resolve();
//         }, action.seconds * 1000);
//         break;
        
//       case 'thinkFor':
//         setSprites(prevSprites => 
//           prevSprites.map(s => 
//             s.id === sprite.id 
//               ? { ...s, speech: action.text, speechType: 'think' }
//               : s
//           )
//         );
//         setTimeout(() => {
//           setSprites(prevSprites => 
//             prevSprites.map(s => 
//               s.id === sprite.id 
//                 ? { ...s, speech: '', speechType: '' }
//                 : s
//             )
//           );
//           resolve();
//         }, action.seconds * 1000);
//         break;
        
//       default:
//         resolve();
//     }
//   });
// };

// // NEW: Animal Name Popup Component
// const AnimalNamePopup = ({ isOpen, onClose, onConfirm, randomAnimal }) => {
//   const [animalName, setAnimalName] = useState('');

//   useEffect(() => {
//     if (isOpen && randomAnimal) {
//       setAnimalName(randomAnimal.type); // Default name is the animal type
//     }
//   }, [isOpen, randomAnimal]);

//   const handleConfirm = () => {
//     if (animalName.trim()) {
//       onConfirm(animalName.trim());
//       setAnimalName('');
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleConfirm();
//     }
//   };

//   if (!isOpen || !randomAnimal) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.8, opacity: 0, y: 20 }}
//         animate={{ scale: 1, opacity: 1, y: 0 }}
//         exit={{ scale: 0.8, opacity: 0, y: 20 }}
//         className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full border-4 border-blue-200"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="text-center mb-6">
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//             className="text-6xl sm:text-8xl mb-4"
//           >
//             {randomAnimal.emoji}
//           </motion.div>
//           <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
//             Name Your {randomAnimal.type}!
//           </h2>
//           <p className="text-gray-600 text-sm sm:text-base">
//             Give your new sprite a custom name
//           </p>
//         </div>

//         <div className="space-y-4">
//           <input
//             type="text"
//             value={animalName}
//             onChange={(e) => setAnimalName(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder={`Enter name for ${randomAnimal.type}`}
//             className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             autoFocus
//             maxLength={20}
//           />

//           <div className="flex gap-3">
//             <motion.button
//               onClick={onClose}
//               className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-300"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               Cancel
//             </motion.button>
//             <motion.button
//               onClick={handleConfirm}
//               disabled={!animalName.trim()}
//               className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-all duration-300"
//               whileHover={animalName.trim() ? { scale: 1.02 } : {}}
//               whileTap={animalName.trim() ? { scale: 0.98 } : {}}
//             >
//               Add Sprite
//             </motion.button>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// // Draggable Block Component
// const DraggableBlock = ({ block, isPlaying, children }) => {
//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: 'block',
//     item: { 
//       blockData: block,
//       id: `${block.id}-${Date.now()}`
//     },
//     canDrag: !isPlaying,
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   }), [block, isPlaying]);

//   return (
//     <div
//       ref={drag}
//       className={`${isDragging ? 'opacity-50' : 'opacity-100'} ${
//         isPlaying ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
//       }`}
//     >
//       {children}
//     </div>
//   );
// };

// // Dropped Action Block Component with Enhanced Repeat Display
// const DroppedActionBlock = ({ action, index, onRemove, isPlaying }) => {
//   const getActionDisplay = (action) => {
//     if (typeof action === 'string') {
//       return action;
//     }
//     switch (action.type) {
//       case 'moveSteps':
//         return `Move ${action.steps} steps${action.direction ? ` ${action.direction}` : ''}`;
//       case 'turnDegrees':
//         return `Turn ${action.degrees}°`;
//       case 'goToXY':
//         return `Go to (${action.x}, ${action.y})`;
//       case 'sayFor':
//         return `Say "${action.text}" for ${action.seconds}s`;
//       case 'thinkFor':
//         return `Think "${action.text}" for ${action.seconds}s`;
//       case 'repeat':
//         return `Repeat ${action.times} times (${action.actions.length} actions)`;
//       default:
//         return JSON.stringify(action);
//     }
//   };

//   const getBlockColor = (action) => {
//     if (typeof action === 'string') {
//       if (['moveRight', 'moveLeft', 'moveUp', 'moveDown', 'spin360'].includes(action)) {
//         return 'from-blue-500 to-indigo-600';
//       }
//       if (['sayHello', 'thinkHmm'].includes(action)) {
//         return 'from-purple-500 to-pink-600';
//       }
//     }
//     switch (action.type) {
//       case 'moveSteps':
//       case 'turnDegrees':
//       case 'goToXY':
//         return 'from-blue-500 to-indigo-600';
//       case 'sayFor':
//       case 'thinkFor':
//         return 'from-purple-500 to-pink-600';
//       case 'repeat':
//         return 'from-orange-500 to-red-600';
//       default:
//         return 'from-gray-500 to-gray-600';
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: -20, scale: 0.8 }}
//       animate={{ opacity: 1, x: 0, scale: 1 }}
//       exit={{ opacity: 0, x: 20, scale: 0.8 }}
//       className={`bg-gradient-to-r ${getBlockColor(action)} text-white px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg mb-2 sm:mb-3 border border-white/20 backdrop-blur-sm`}
//       whileHover={{ scale: 1.02, y: -2 }}
//       transition={{ type: "spring", stiffness: 300, damping: 30 }}
//     >
//       <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
//         <motion.div 
//           className="text-xs bg-white/20 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold shadow-sm flex-shrink-0"
//           whileHover={{ rotate: 360 }}
//           transition={{ duration: 0.5 }}
//         >
//           {index + 1}
//         </motion.div>
//         <div className="flex flex-col min-w-0 flex-1">
//           <span className="drop-shadow-sm truncate">{getActionDisplay(action)}</span>
//           {action.type === 'repeat' && (
//             <div className="text-xs opacity-80 mt-1">
//               {action.actions.map((subAction, i) => (
//                 <div key={i} className="ml-2 truncate">
//                   • {getActionDisplay(subAction)}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <motion.button
//         onClick={() => onRemove(index)}
//         disabled={isPlaying}
//         className="text-white/80 hover:text-red-200 disabled:opacity-50 text-lg leading-none ml-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/20 transition-all flex-shrink-0"
//         whileHover={{ scale: 1.1, rotate: 90 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         ×
//       </motion.button>
//     </motion.div>
//   );
// };

// // Enhanced Motion Blocks Component with Repeat - Mobile Optimized
// const MotionBlocks = ({ isPlaying }) => {
//   const [customSteps, setCustomSteps] = useState(10);
//   const [customDegrees, setCustomDegrees] = useState(90);
//   const [customX, setCustomX] = useState(100);
//   const [customY, setCustomY] = useState(100);
//   const [repeatTimes, setRepeatTimes] = useState(3);

//   const motionBlocks = [
//     {
//       id: 'moveSteps',
//       label: 'move',
//       subLabel: 'steps',
//       gradient: 'from-blue-500 to-cyan-500',
//       icon: '🚀',
//       action: { type: 'moveSteps', steps: customSteps },
//       customInput: (
//         <input
//           type="number"
//           value={customSteps}
//           onChange={(e) => setCustomSteps(parseInt(e.target.value) || 0)}
//           className="w-12 sm:w-14 text-xs bg-white/90 border border-blue-200 rounded-lg px-1 sm:px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
//           disabled={isPlaying}
//           onClick={(e) => e.stopPropagation()}
//         />
//       )
//     },
//     {
//       id: 'turnDegrees',
//       label: 'turn',
//       subLabel: 'degrees',
//       gradient: 'from-blue-500 to-indigo-600',
//       icon: '🌀',
//       action: { type: 'turnDegrees', degrees: customDegrees },
//       customInput: (
//         <input
//           type="number"
//           value={customDegrees}
//           onChange={(e) => setCustomDegrees(parseInt(e.target.value) || 0)}
//           className="w-12 sm:w-14 text-xs bg-white/90 border border-blue-200 rounded-lg px-1 sm:px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
//           disabled={isPlaying}
//           onClick={(e) => e.stopPropagation()}
//         />
//       )
//     },
//     {
//       id: 'goToXY',
//       label: 'go to',
//       subLabel: 'coordinates',
//       gradient: 'from-blue-600 to-purple-600',
//       icon: '🎯',
//       action: { type: 'goToXY', x: customX, y: customY },
//       customInput: (
//         <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
//           <input
//             type="number"
//             value={customX}
//             onChange={(e) => setCustomX(parseInt(e.target.value) || 0)}
//             className="w-10 sm:w-12 text-xs bg-white/90 border border-blue-200 rounded-lg px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
//             disabled={isPlaying}
//             placeholder="X"
//           />
//           <input
//             type="number"
//             value={customY}
//             onChange={(e) => setCustomY(parseInt(e.target.value) || 0)}
//             className="w-10 sm:w-12 text-xs bg-white/90 border border-blue-200 rounded-lg px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
//             disabled={isPlaying}
//             placeholder="Y"
//           />
//         </div>
//       )
//     },
//     {
//       id: 'repeat',
//       label: 'repeat',
//       subLabel: 'times (last 2 actions)',
//       gradient: 'from-orange-500 to-red-600',
//       icon: '🔄',
//       action: { type: 'repeat', times: repeatTimes, actions: [] },
//       customInput: (
//         <input
//           type="number"
//           value={repeatTimes}
//           onChange={(e) => setRepeatTimes(parseInt(e.target.value) || 1)}
//           className="w-12 sm:w-14 text-xs bg-white/90 border border-orange-200 rounded-lg px-1 sm:px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 backdrop-blur-sm"
//           disabled={isPlaying}
//           onClick={(e) => e.stopPropagation()}
//           min="1"
//         />
//       )
//     }
//   ];

//   return (
//     <div className="space-y-2 sm:space-y-3">
//       {motionBlocks.map((block, index) => (
//         <DraggableBlock key={block.id} block={block} isPlaying={isPlaying}>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.05 }}
//             className={`bg-gradient-to-r ${block.gradient} ${
//               isPlaying ? 'opacity-50' : 'hover:shadow-xl active:scale-95'
//             } text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium w-full transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg border border-white/20 backdrop-blur-sm`}
//             whileHover={isPlaying ? {} : { scale: 1.02, y: -2 }}
//             whileTap={isPlaying ? {} : { scale: 0.98 }}
//           >
//             <span className="text-base sm:text-lg flex-shrink-0">{block.icon}</span>
//             <div className="flex flex-col gap-1 flex-1 min-w-0">
//               <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
//                 <span className="drop-shadow-sm">{block.label}</span>
//                 {block.customInput}
//                 {block.subLabel && <span className="text-xs opacity-90 drop-shadow-sm hidden sm:inline">{block.subLabel}</span>}
//               </div>
//             </div>
//           </motion.div>
//         </DraggableBlock>
//       ))}
//     </div>
//   );
// };

// // Looks Blocks Component - Mobile Optimized
// const LooksBlocks = ({ isPlaying }) => {
//   const [sayText, setSayText] = useState('Hello!');
//   const [saySeconds, setSaySeconds] = useState(2);
//   const [thinkText, setThinkText] = useState('Hmm...');
//   const [thinkSeconds, setThinkSeconds] = useState(2);

//   const looksBlocks = [
//     {
//       id: 'sayFor',
//       label: 'say',
//       gradient: 'from-purple-500 to-pink-600',
//       icon: '💬',
//       action: { type: 'sayFor', text: sayText, seconds: saySeconds },
//       customInput: (
//         <div className="flex items-center gap-1 sm:gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
//           <input
//             type="text"
//             value={sayText}
//             onChange={(e) => setSayText(e.target.value)}
//             className="w-16 sm:w-20 text-xs bg-white/90 border border-purple-200 rounded-lg px-1 sm:px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
//             disabled={isPlaying}
//             placeholder="text"
//           />
//           <span className="text-xs opacity-80 hidden sm:inline">for</span>
//           <input
//             type="number"
//             value={saySeconds}
//             onChange={(e) => setSaySeconds(parseFloat(e.target.value) || 1)}
//             className="w-10 sm:w-12 text-xs bg-white/90 border border-purple-200 rounded-lg px-1 sm:px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
//             disabled={isPlaying}
//             min="0.1"
//             step="0.1"
//           />
//           <span className="text-xs opacity-80">s</span>
//         </div>
//       )
//     },
//     {
//       id: 'thinkFor',
//       label: 'think',
//       gradient: 'from-indigo-500 to-purple-600',
//       icon: '💭',
//       action: { type: 'thinkFor', text: thinkText, seconds: thinkSeconds },
//       customInput: (
//         <div className="flex items-center gap-1 sm:gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
//           <input
//             type="text"
//             value={thinkText}
//             onChange={(e) => setThinkText(e.target.value)}
//             className="w-16 sm:w-20 text-xs bg-white/90 border border-purple-200 rounded-lg px-1 sm:px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
//             disabled={isPlaying}
//             placeholder="text"
//           />
//           <span className="text-xs opacity-80 hidden sm:inline">for</span>
//           <input
//             type="number"
//             value={thinkSeconds}
//             onChange={(e) => setThinkSeconds(parseFloat(e.target.value) || 1)}
//             className="w-10 sm:w-12 text-xs bg-white/90 border border-purple-200 rounded-lg px-1 sm:px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
//             disabled={isPlaying}
//             min="0.1"
//             step="0.1"
//           />
//           <span className="text-xs opacity-80">s</span>
//         </div>
//       )
//     }
//   ];

//   return (
//     <div className="space-y-2 sm:space-y-3">
//       {looksBlocks.map((block, index) => (
//         <DraggableBlock key={block.id} block={block} isPlaying={isPlaying}>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.05 }}
//             className={`bg-gradient-to-r ${block.gradient} ${
//               isPlaying ? 'opacity-50' : 'hover:shadow-xl active:scale-95'
//             } text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium w-full transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg border border-white/20 backdrop-blur-sm`}
//             whileHover={isPlaying ? {} : { scale: 1.02, y: -2 }}
//             whileTap={isPlaying ? {} : { scale: 0.98 }}
//           >
//             <span className="text-base sm:text-lg flex-shrink-0">{block.icon}</span>
//             <div className="flex flex-col gap-1 flex-1 min-w-0">
//               <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
//                 <span className="drop-shadow-sm">{block.label}</span>
//                 {block.customInput}
//               </div>
//             </div>
//           </motion.div>
//         </DraggableBlock>
//       ))}
//     </div>
//   );
// };

// // Enhanced Code Area with Repeat Support - Mobile Optimized
// const CodeArea = ({ spriteActions, selectedSpriteId, sprites, onAddAction, onRemoveAction, onClearAllActions, isPlaying }) => {
//   const selectedSprite = sprites.find(s => s.id === selectedSpriteId);
//   const actions = spriteActions[selectedSpriteId] || [];

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: 'block',
//     drop: (item) => {
//       if (selectedSpriteId && item.blockData) {
//         let actionToAdd = item.blockData.action;
        
//         // Handle repeat block special case
//         if (actionToAdd.type === 'repeat') {
//           const lastTwoActions = actions.slice(-2);
//           actionToAdd = {
//             ...actionToAdd,
//             actions: lastTwoActions
//           };
//         }
        
//         onAddAction(actionToAdd, selectedSpriteId);
//       }
//     },
//     collect: (monitor) => ({
//       isOver: monitor.isOver(),
//     }),
//   }), [selectedSpriteId, onAddAction, actions]);

//   if (!selectedSpriteId) {
//     return (
//       <div className="text-center py-10 sm:py-20">
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ type: "spring", stiffness: 200, damping: 20 }}
//           className="text-4xl sm:text-8xl mb-4 sm:mb-6"
//         >
//           🎯
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4"
//         >
//           Select a Sprite to Start Coding
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="text-sm sm:text-base text-gray-500 px-4"
//         >
//           Choose a sprite from the library to begin your creative journey
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
//         <motion.h4 
//           className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//         >
//           Code for {selectedSprite?.name}
//         </motion.h4>
//         {actions.length > 0 && (
//           <motion.button
//             onClick={() => onClearAllActions(selectedSpriteId)}
//             disabled={isPlaying}
//             className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-3 sm:px-4 py-2 rounded-xl font-medium shadow-lg transition-all duration-300 text-sm"
//             whileHover={{ scale: 1.05, y: -2 }}
//             whileTap={{ scale: 0.95 }}
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 1, scale: 1 }}
//           >
//             Clear All
//           </motion.button>
//         )}
//       </div>
      
//       <div
//         ref={drop}
//         className={`min-h-64 sm:min-h-96 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all duration-300 ${
//           isOver 
//             ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl scale-105' 
//             : actions.length === 0
//               ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50'
//               : 'border-gray-200 bg-gradient-to-br from-white to-blue-50 shadow-lg'
//         }`}
//       >
//         {actions.length === 0 ? (
//           <motion.div 
//             className="flex flex-col items-center justify-center h-full text-gray-400 py-10 sm:py-20"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//           >
//             <motion.div 
//               className="text-4xl sm:text-8xl mb-4 sm:mb-6"
//               animate={{ 
//                 rotate: [0, -10, 10, -10, 0]
//               }}
//               transition={{ 
//                 duration: 2,
//                 repeat: Infinity,
//                 repeatDelay: 3
//               }}
//             >
//               📝
//             </motion.div>
//             <motion.div 
//               className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-center"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//             >
//               Drag Blocks Here to Code
//             </motion.div>
//             <motion.div 
//               className="text-sm sm:text-lg text-center px-4"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//             >
//               Create amazing animations by combining motion and looks blocks
//               <br />
//               <span className="text-orange-500 font-semibold">Try the Repeat block to loop your last 2 actions!</span>
//             </motion.div>
//           </motion.div>
//         ) : (
//           <div className="space-y-2 sm:space-y-3">
//             <motion.div 
//               className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6 font-medium flex items-center gap-2 sm:gap-3"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//             >
//               <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
//                 {actions.length}
//               </span>
//               <span className="text-xs sm:text-sm">action{actions.length !== 1 ? 's' : ''} queued for execution</span>
//             </motion.div>
//             <AnimatePresence>
//               {actions.map((action, index) => (
//                 <DroppedActionBlock
//                   key={`${index}-${JSON.stringify(action)}`}
//                   action={action}
//                   index={index}
//                   onRemove={(idx) => onRemoveAction(selectedSpriteId, idx)}
//                   isPlaying={isPlaying}
//                 />
//               ))}
//             </AnimatePresence>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Fixed Sprite Component (no multi-keyframe animations) with Boundary Restrictions - Mobile Optimized
// const Sprite = ({ sprite, isSelected, onSelect, onMove, onRemove, stageWidth, stageHeight, isPlaying }) => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [stageRect, setStageRect] = useState(null);

//   const handleMouseDown = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
    
//     let stageElement = e.currentTarget.parentElement;
//     while (stageElement && !stageElement.classList.contains('stage-container')) {
//       stageElement = stageElement.parentElement;
//     }
    
//     if (stageElement) {
//       const rect = stageElement.getBoundingClientRect();
//       setStageRect(rect);
//       setDragStart({
//         x: e.clientX - rect.left - sprite.x,
//         y: e.clientY - rect.top - sprite.y
//       });
//     }
    
//     setIsDragging(true);
//     onSelect(sprite.id);
//   };

//   const handleTouchStart = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
    
//     let stageElement = e.currentTarget.parentElement;
//     while (stageElement && !stageElement.classList.contains('stage-container')) {
//       stageElement = stageElement.parentElement;
//     }
    
//     if (stageElement && e.touches[0]) {
//       const rect = stageElement.getBoundingClientRect();
//       setStageRect(rect);
//       setDragStart({
//         x: e.touches[0].clientX - rect.left - sprite.x,
//         y: e.touches[0].clientY - rect.top - sprite.y
//       });
//     }
    
//     setIsDragging(true);
//     onSelect(sprite.id);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging || !stageRect) return;
    
//     // Strict boundary enforcement - sprites cannot go outside stage boundaries
//     const x = Math.max(25, Math.min(stageWidth - 25, e.clientX - stageRect.left - dragStart.x));
//     const y = Math.max(25, Math.min(stageHeight - 25, e.clientY - stageRect.top - dragStart.y));
//     onMove(sprite.id, x, y);
//   };

//   const handleTouchMove = (e) => {
//     if (!isDragging || !stageRect || !e.touches[0]) return;
    
//     e.preventDefault();
//     const x = Math.max(25, Math.min(stageWidth - 25, e.touches[0].clientX - stageRect.left - dragStart.x));
//     const y = Math.max(25, Math.min(stageHeight - 25, e.touches[0].clientY - stageRect.top - dragStart.y));
//     onMove(sprite.id, x, y);
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//     setStageRect(null);
//   };

//   useEffect(() => {
//     if (isDragging) {
//       document.addEventListener('mousemove', handleMouseMove);
//       document.addEventListener('mouseup', handleMouseUp);
//       document.addEventListener('touchmove', handleTouchMove, { passive: false });
//       document.addEventListener('touchend', handleMouseUp);
//       return () => {
//         document.removeEventListener('mousemove', handleMouseMove);
//         document.removeEventListener('mouseup', handleMouseUp);
//         document.removeEventListener('touchmove', handleTouchMove);
//         document.removeEventListener('touchend', handleMouseUp);
//       };
//     }
//   }, [isDragging, stageRect, dragStart]);

//   const spriteSize = Math.min(stageWidth, stageHeight) < 400 ? 20 : 25;

//   return (
//     <motion.div
//       style={{
//         position: 'absolute',
//         left: sprite.x - spriteSize,
//         top: sprite.y - spriteSize,
//         cursor: 'pointer',
//         zIndex: isSelected ? 10 : 1
//       }}
//       animate={{
//         scale: sprite.hasCollided ? 1.3 : sprite.size,
//         rotate: sprite.rotation
//       }}
//       transition={{ 
//         duration: 0.3,
//         type: "spring",
//         stiffness: 300,
//         damping: 30
//       }}
//       onMouseDown={handleMouseDown}
//       onTouchStart={handleTouchStart}
//       className={`select-none ${isSelected ? 'ring-2 sm:ring-4 ring-blue-400 rounded-full bg-blue-100/50' : ''} p-1 sm:p-2 relative group`}
//       whileHover={{ scale: sprite.size * 1.1 }}
//       whileTap={{ scale: sprite.size * 0.95 }}
//     >
//       <div className={`${stageWidth < 400 ? 'text-3xl' : 'text-4xl sm:text-5xl'} drop-shadow-2xl filter hover:brightness-110 transition-all`}>
//         {ANIMALS_LIST[sprite.animalType] || '🎯'}
//       </div>
      
//       {/* Remove button that appears on hover */}
//       <motion.button
//         onClick={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           onRemove(sprite.id);
//         }}
//         disabled={isPlaying}
//         className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full text-xs sm:text-sm flex items-center justify-center shadow-lg font-bold border-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-200"
//         whileHover={isPlaying ? {} : { scale: 1.15, rotate: 90 }}
//         whileTap={isPlaying ? {} : { scale: 0.9 }}
//         initial={{ opacity: 0, scale: 0 }}
//         animate={{ opacity: 0, scale: 1 }}
//         whileInView={{ opacity: 0 }}
//         style={{ opacity: 0 }}
//       >
//         ×
//       </motion.button>

//       {sprite.speech && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.5, y: 10 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.5, y: 10 }}
//           className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 sm:mb-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl whitespace-nowrap shadow-2xl border backdrop-blur-sm max-w-32 sm:max-w-none ${
//             sprite.speechType === 'think' 
//               ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300' 
//               : 'bg-gradient-to-r from-white to-blue-50 text-gray-800 border-gray-200'
//           }`}
//         >
//           {sprite.speechType === 'think' && '💭 '}
//           <span className="font-medium">{sprite.speech}</span>
//           <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
//             sprite.speechType === 'think' ? 'border-t-4 border-t-blue-500' : 'border-t-4 border-t-white'
//           }`}></div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// // Stage Component - Responsive with dynamic sizing
// const Stage = ({ sprites, selectedSpriteId, onSpriteSelect, onSpriteMove, onSpriteRemove, stageWidth, stageHeight, isPlaying }) => {
//   return (
//     <div 
//       className="stage-container relative w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 border-2 sm:border-4 border-blue-300 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
//       style={{ width: stageWidth, height: stageHeight, minWidth: stageWidth, minHeight: stageHeight }}
//     >
//       {/* Stage boundary indicator */}
//       <div className="absolute inset-1 sm:inset-2 border-1 sm:border-2 border-dashed border-blue-300/50 rounded-lg sm:rounded-xl pointer-events-none"></div>
      
//       {/* Animated background pattern */}
//       <div className="absolute inset-0 opacity-10">
//         <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-4 sm:w-8 h-4 sm:h-8 bg-yellow-300 rounded-full animate-bounce"></div>
//         <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-3 sm:w-6 h-3 sm:h-6 bg-pink-300 rounded-full animate-ping"></div>
//         <div className="absolute bottom-3 sm:bottom-6 left-4 sm:left-8 w-2 sm:w-4 h-2 sm:h-4 bg-green-300 rounded-full animate-pulse"></div>
//       </div>
      
//       <AnimatePresence>
//         {sprites.map((sprite) => (
//           <Sprite
//             key={sprite.id}
//             sprite={sprite}
//             isSelected={selectedSpriteId === sprite.id}
//             onSelect={onSpriteSelect}
//             onMove={onSpriteMove}
//             onRemove={onSpriteRemove}
//             stageWidth={stageWidth}
//             stageHeight={stageHeight}
//             isPlaying={isPlaying}
//           />
//         ))}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Enhanced Playback Controls - Mobile Optimized
// const PlaybackControls = ({ 
//   onPlay, 
//   onPause, 
//   onStop, 
//   onRemoveSprite, 
//   isPlaying, 
//   selectedSpriteId, 
//   sprites, 
//   spriteActions,
//   playForAll,
//   setPlayForAll
// }) => {
//   const selectedSprite = sprites.find(s => s.id === selectedSpriteId);
//   const hasActions = selectedSpriteId && spriteActions[selectedSpriteId]?.length > 0;
//   const hasAnyActions = Object.values(spriteActions).some(actions => actions?.length > 0);

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* Play Mode Toggle */}
//       <motion.div 
//         className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         <label className="flex items-center gap-3 sm:gap-4 text-sm cursor-pointer">
//           <input
//             type="checkbox"
//             checked={playForAll}
//             onChange={(e) => setPlayForAll(e.target.checked)}
//             disabled={isPlaying}
//             className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded-lg focus:ring-blue-500 focus:ring-2"
//           />
//           <span className="text-gray-700 font-semibold text-sm sm:text-base">🎭 Play All Sprites</span>
//         </label>
//       </motion.div>

//       {/* Playback Buttons */}
//       <div className="grid grid-cols-3 gap-2 sm:gap-3">
//         <motion.button
//           onClick={onPlay}
//           disabled={isPlaying || (!playForAll && !hasActions) || (playForAll && !hasAnyActions)}
//           className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 text-white px-2 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300 shadow-lg"
//           whileHover={{ scale: 1.05, y: -2 }}
//           whileTap={{ scale: 0.95 }}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           {isPlaying ? (
//             <>
//               <motion.div 
//                 className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"
//                 animate={{ scale: [1, 1.5, 1] }}
//                 transition={{ duration: 1, repeat: Infinity }}
//               ></motion.div>
//               <span className="hidden sm:inline">Playing</span>
//             </>
//           ) : (
//             <>
//               ▶️ <span className="hidden sm:inline">Play</span>
//             </>
//           )}
//         </motion.button>
        
//         <motion.button
//           onClick={onPause}
//           disabled={!isPlaying}
//           className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 text-white px-2 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-lg"
//           whileHover={{ scale: 1.05, y: -2 }}
//           whileTap={{ scale: 0.95 }}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           ⏸️ <span className="hidden sm:inline">Pause</span>
//         </motion.button>
        
//         <motion.button
//           onClick={onStop}
//           disabled={!isPlaying}
//           className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 text-white px-2 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-lg"
//           whileHover={{ scale: 1.05, y: -2 }}
//           whileTap={{ scale: 0.95 }}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//         >
//           ⏹️ <span className="hidden sm:inline">Stop</span>
//         </motion.button>
//       </div>

//       {/* Hero Feature Info */}
//       <motion.div 
//         className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg"
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ type: "spring", stiffness: 200, damping: 20 }}
//       >
//         <div className="text-xs sm:text-sm text-orange-700 mb-2 font-bold flex items-center gap-2">
//           ⭐ HERO FEATURE: Animation Swap on Collision
//         </div>
//         <div className="text-xs text-orange-600">
//           When two sprites collide, they will swap their entire animation sequences! The stage has strict boundaries - sprites cannot escape.
//         </div>
//       </motion.div>

//       {/* Selected Sprite Info */}
//       {selectedSprite && (
//         <motion.div 
//           className="bg-gradient-to-r from-white to-blue-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ type: "spring", stiffness: 200, damping: 20 }}
//         >
//           <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 font-medium">Selected Sprite</div>
//           <div className="flex items-center justify-between gap-3">
//             <div className="min-w-0 flex-1">
//               <span className="text-gray-800 font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 {selectedSprite.name}
//               </span>
//               <div className="text-xs sm:text-sm text-gray-500 mt-1">
//                 <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
//                   {spriteActions[selectedSpriteId]?.length || 0} actions queued
//                 </span>
//               </div>
//             </div>
//             <motion.button
//               onClick={() => onRemoveSprite(selectedSpriteId)}
//               disabled={isPlaying}
//               className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-3 sm:px-4 py-2 rounded-xl font-medium shadow-lg transition-all duration-300 text-xs sm:text-sm flex-shrink-0"
//               whileHover={{ scale: 1.05, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Remove
//             </motion.button>
//           </div>
//         </motion.div>
//       )}
      
//       {/* Status Info */}
//       <motion.div 
//         className="text-xs sm:text-sm bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.4 }}
//       >
//         <div className="text-gray-600 font-medium">
//           {playForAll 
//             ? `🎪 Playing all sprites with actions (${Object.keys(spriteActions).filter(id => spriteActions[id]?.length > 0).length} active)`
//             : selectedSpriteId 
//               ? `🎯 Playing ${selectedSprite?.name} only`
//               : '⚠️ No sprite selected'
//           }
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // Enhanced Collision Detection Hook - Fixed for exact challenge requirements
// const useCollisionDetection = (sprites, onCollision) => {
//   useEffect(() => {
//     const checkCollisions = () => {
//       for (let i = 0; i < sprites.length; i++) {
//         for (let j = i + 1; j < sprites.length; j++) {
//           const sprite1 = sprites[i];
//           const sprite2 = sprites[j];
          
//           const distance = Math.sqrt(
//             Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2)
//           );
          
//           // Collision threshold
//           if (distance < 55 && !sprite1.hasCollided && !sprite2.hasCollided) {
//             onCollision(sprite1.id, sprite2.id);
//           }
//         }
//       }
//     };

//     const interval = setInterval(checkCollisions, 100);
//     return () => clearInterval(interval);
//   }, [sprites, onCollision]);
// };

// // Main Component - Fully Responsive
// function ScratchCloneMain() {
//   const [sprites, setSprites] = useState([]);
//   const [selectedSpriteId, setSelectedSpriteId] = useState(null);
//   const [spriteIdCounter, setSpriteIdCounter] = useState(1);
//   const [spriteActionQueues, setSpriteActionQueues] = useState({});
//   const [currentlyExecutingActions, setCurrentlyExecutingActions] = useState({});
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [playForAll, setPlayForAll] = useState(true);
//   const [debugLogs, setDebugLogs] = useState([]);
//   const playbackRef = useRef(null);

//   // NEW: Popup states
//   const [showNamePopup, setShowNamePopup] = useState(false);
//   const [randomAnimal, setRandomAnimal] = useState(null);

//   // Calculate stage dimensions responsively
//   const [stageWidth, setStageWidth] = useState(300);
//   const [stageHeight, setStageHeight] = useState(225);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const updateDimensions = () => {
//       if (typeof window !== 'undefined') {
//         const screenWidth = window.innerWidth;
//         const screenHeight = window.innerHeight;
        
//         setIsMobile(screenWidth < 768);
        
//         // Responsive stage sizing
//         let width, height;
        
//         if (screenWidth < 640) { // Mobile
//           width = Math.min(screenWidth - 40, 300);
//           height = width * 0.75;
//         } else if (screenWidth < 1024) { // Tablet
//           width = Math.min(screenWidth * 0.4, 400);
//           height = width * 0.75;
//         } else { // Desktop
//           width = Math.min(screenWidth * 0.45, 600);
//           height = width * 0.75;
//         }
        
//         setStageWidth(Math.max(width, 250));
//         setStageHeight(Math.max(height, 187));
//       }
//     };

//     updateDimensions();
//     window.addEventListener('resize', updateDimensions);
//     return () => window.removeEventListener('resize', updateDimensions);
//   }, []);

//   const addDebugLog = useCallback((message) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setDebugLogs(prev => [...prev.slice(-4), `[${timestamp}] ${message}`]);
//   }, []);

//   // NEW: Get random animal function
//   const getRandomAnimal = () => {
//     const animalTypes = Object.keys(ANIMALS_LIST);
//     const randomType = animalTypes[Math.floor(Math.random() * animalTypes.length)];
//     return {
//       type: randomType,
//       emoji: ANIMALS_LIST[randomType]
//     };
//   };

//   // NEW: Handle + button click
//   const handleAddRandomAnimal = () => {
//     if (isPlaying) return;
//     const animal = getRandomAnimal();
//     setRandomAnimal(animal);
//     setShowNamePopup(true);
//   };

//   // NEW: Handle popup confirm
//   const handlePopupConfirm = (customName) => {
//     const newSprite = {
//       id: spriteIdCounter,
//       name: customName,
//       animalType: randomAnimal.type,
//       x: Math.random() * (stageWidth - 100) + 50,
//       y: Math.random() * (stageHeight - 100) + 50,
//       rotation: 0,
//       size: 1,
//       visible: true,
//       speech: '',
//       speechType: '',
//       hasCollided: false,
//     };
//     setSprites(prev => [...prev, newSprite]);
//     setSpriteIdCounter(prev => prev + 1);
//     setSelectedSpriteId(newSprite.id);
//     addDebugLog(`🌟 Added ${customName} (${randomAnimal.type})`);
//     setShowNamePopup(false);
//     setRandomAnimal(null);
//   };

//   // NEW: Handle popup close
//   const handlePopupClose = () => {
//     setShowNamePopup(false);
//     setRandomAnimal(null);
//   };

//   const availableSprites = [
//     { name: 'Cat', emoji: '🐱', color: 'from-orange-400 to-red-500' },
//     { name: 'Dog', emoji: '🐶', color: 'from-amber-400 to-orange-500' },
//     { name: 'Lion', emoji: '🦁', color: 'from-yellow-400 to-orange-500' },
//     { name: 'Tiger', emoji: '🐅', color: 'from-orange-500 to-red-600' },
//     { name: 'Bear', emoji: '🐻', color: 'from-amber-600 to-brown-700' },
//     { name: 'Fox', emoji: '🦊', color: 'from-orange-400 to-red-500' }
//   ];

// // HERO FEATURE: Enhanced collision handler that swaps COMPLETE animation sequences
// const [collisionCooldowns, setCollisionCooldowns] = useState(new Set());

// const handleCollision = useCallback((sprite1Id, sprite2Id) => {
//   // Create unique collision pair key (order doesn't matter)
//   const collisionKey = [sprite1Id, sprite2Id].sort().join('-');
  
//   // Check if this collision pair is on cooldown
//   if (collisionCooldowns.has(collisionKey)) {
//     return; // Skip if already processed recently
//   }

//   // Get fresh references to sprites and their queues
//   const sprite1 = sprites.find(s => s.id === sprite1Id);
//   const sprite2 = sprites.find(s => s.id === sprite2Id);
  
//   if (!sprite1 || !sprite2) {
//     console.warn('Collision detected but sprites not found:', sprite1Id, sprite2Id);
//     return;
//   }

//   const sprite1Name = sprite1.name || `Sprite${sprite1Id}`;
//   const sprite2Name = sprite2.name || `Sprite${sprite2Id}`;

//   // Add collision pair to cooldown set
//   setCollisionCooldowns(prev => new Set([...prev, collisionKey]));

//   addDebugLog(`💥 COLLISION DETECTED! ${sprite1Name} ↔ ${sprite2Name}`);
//   addDebugLog(`🎭 HERO FEATURE ACTIVATED: Complete Animation Swap!`);
//   addDebugLog(`🔒 Collision cooldown activated for pair: ${collisionKey}`);

//   // Get the CURRENT complete animation sequences at the time of collision
//   setSpriteActionQueues(prev => {
//     const sprite1CompleteActions = [...(prev[sprite1Id] || [])];
//     const sprite2CompleteActions = [...(prev[sprite2Id] || [])];
    
//     addDebugLog(`📝 ${sprite1Name} had ${sprite1CompleteActions.length} actions`);
//     addDebugLog(`📝 ${sprite2Name} had ${sprite2CompleteActions.length} actions`);
//     addDebugLog(`✨ ${sprite1Name} now gets ALL of ${sprite2Name}'s animations`);
//     addDebugLog(`✨ ${sprite2Name} now gets ALL of ${sprite1Name}'s animations`);
    
//     return {
//       ...prev,
//       [sprite1Id]: sprite2CompleteActions,  // Complete swap
//       [sprite2Id]: sprite1CompleteActions   // Complete swap
//     };
//   });

//   // Immediately mark sprites as collided to prevent re-processing
//   setSprites(prevSprites =>
//     prevSprites.map(sprite => {
//       if (sprite.id === sprite1Id) {
//         return {
//           ...sprite,
//           hasCollided: true,
//           speech: `I swapped animations with ${sprite2Name}! 🎭`,
//           speechType: 'say'
//         };
//       }
//       if (sprite.id === sprite2Id) {
//         return {
//           ...sprite,
//           hasCollided: true,
//           speech: `I swapped animations with ${sprite1Name}! 🎭`,
//           speechType: 'say'
//         };
//       }
//       return sprite;
//     })
//   );

//   // Reset collision state and speech after delay + Remove from cooldown
//   setTimeout(() => {
//     setSprites(prevSprites =>
//       prevSprites.map(sprite => {
//         if (sprite.id === sprite1Id || sprite.id === sprite2Id) {
//           return {
//             ...sprite,
//             hasCollided: false,
//             speech: '',
//             speechType: ''
//           };
//         }
//         return sprite;
//       })
//     );
    
//     // Remove collision pair from cooldown after 5 seconds
//     setTimeout(() => {
//       setCollisionCooldowns(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(collisionKey);
//         addDebugLog(`🔓 Collision cooldown removed for pair: ${collisionKey}`);
//         return newSet;
//       });
//     }, 2000); // Additional 2 seconds before allowing new collision
    
//   }, 3000);

// }, [sprites, addDebugLog, collisionCooldowns]); // Added collisionCooldowns dependency

//   useCollisionDetection(sprites, handleCollision);

//   const handleAddAction = (action, spriteId) => {
//     if (isPlaying) return;
    
//     if (!spriteId) {
//       addDebugLog(`⚠️ Please select a sprite first!`);
//       return;
//     }
    
//     const sprite = sprites.find(s => s.id === spriteId);
//     const spriteName = sprite?.name || `Sprite${spriteId}`;
    
//     setSpriteActionQueues(prev => {
//       const currentActions = prev[spriteId] || [];
//       const newActions = [...currentActions, action];
      
//       const actionDisplay = typeof action === 'string' ? action : 
//         action.type === 'moveSteps' ? `Move ${action.steps} steps` :
//         action.type === 'turnDegrees' ? `Turn ${action.degrees}°` :
//         action.type === 'goToXY' ? `Go to (${action.x}, ${action.y})` :
//         action.type === 'sayFor' ? `Say "${action.text}" for ${action.seconds}s` :
//         action.type === 'thinkFor' ? `Think "${action.text}" for ${action.seconds}s` :
//         action.type === 'repeat' ? `Repeat ${action.times} times` :
//         JSON.stringify(action);
      
//       addDebugLog(`➕ Added "${actionDisplay}" to ${spriteName}`);
      
//       return {
//         ...prev,
//         [spriteId]: newActions
//       };
//     });
//   };

//   const handleSpriteMove = (spriteId, x, y) => {
//     if (isPlaying) return;
//     setSprites(prevSprites => 
//       prevSprites.map(sprite => 
//         sprite.id === spriteId ? { ...sprite, x, y } : sprite
//       )
//     );
//   };

//   const handleAddSprite = (spriteData) => {
//     const spriteType = typeof spriteData === 'string' ? spriteData : spriteData.name;
//     const existingSprite = sprites.find(sprite => sprite.animalType === spriteType);
//     if (existingSprite) {
//       addDebugLog(`🎯 ${existingSprite.name} selected!`);
//       setSelectedSpriteId(existingSprite.id);
//       return;
//     }

//     const newSprite = {
//       id: spriteIdCounter,
//       name: spriteType,
//       animalType: spriteType,
//       x: Math.random() * (stageWidth - 100) + 50,
//       y: Math.random() * (stageHeight - 100) + 50,
//       rotation: 0,
//       size: 1,
//       visible: true,
//       speech: '',
//       speechType: '',
//       hasCollided: false,
//     };
//     setSprites(prev => [...prev, newSprite]);
//     setSpriteIdCounter(prev => prev + 1);
//     setSelectedSpriteId(newSprite.id);
//     addDebugLog(`🌟 Added ${spriteType}`);
//   };

//   const handleSpriteSelect = (spriteId) => {
//     if (!isPlaying) {
//       if (selectedSpriteId === spriteId) {
//         setSelectedSpriteId(null);
//         addDebugLog(`🔍 Deselected sprite`);
//       } else {
//         setSelectedSpriteId(spriteId);
//         const sprite = sprites.find(s => s.id === spriteId);
//         addDebugLog(`🎯 Selected ${sprite?.name || 'sprite'}`);
//       }
//     }
//   };

//   const handleRemoveSprite = (spriteId) => {
//     if (isPlaying) return;
    
//     const sprite = sprites.find(s => s.id === spriteId);
//     addDebugLog(`🗑️ Removed ${sprite?.name || 'sprite'}`);
    
//     setSprites(prev => prev.filter(sprite => sprite.id !== spriteId));
//     setSpriteActionQueues(prev => {
//       const newQueues = { ...prev };
//       delete newQueues[spriteId];
//       return newQueues;
//     });
    
//     if (selectedSpriteId === spriteId) {
//       setSelectedSpriteId(null);
//     }
//   };

//   const handleRemoveAction = (spriteId, actionIndex) => {
//     if (isPlaying) return;
//     setSpriteActionQueues(prev => {
//       const currentActions = prev[spriteId] || [];
//       const sprite = sprites.find(s => s.id === spriteId);
//       addDebugLog(`➖ Removed action from ${sprite?.name || 'sprite'}`);
      
//       return {
//         ...prev,
//         [spriteId]: currentActions.filter((_, index) => index !== actionIndex)
//       };
//     });
//   };

//   const handleClearAllActions = (spriteId) => {
//     if (isPlaying) return;
//     const sprite = sprites.find(s => s.id === spriteId);
//     addDebugLog(`🧹 Cleared all actions for ${sprite?.name || 'sprite'}`);
    
//     setSpriteActionQueues(prev => ({
//       ...prev,
//       [spriteId]: []
//     }));
//   };

//   const executeActionsSequentially = async (spriteId, actions) => {
//     let remainingActions = [...actions];
//     setCurrentlyExecutingActions(prev => ({
//       ...prev,
//       [spriteId]: remainingActions
//     }));

//     const sprite = sprites.find(s => s.id === spriteId);
//     const spriteName = sprite?.name || `Sprite${spriteId}`;
    
//     for (let i = 0; i < actions.length; i++) {
//       if (!playbackRef.current) {
//         addDebugLog(`⏸️ Playback interrupted for ${spriteName}`);
//         break;
//       }
      
//       const action = remainingActions[0];
//       if (!action) break;
      
//       addDebugLog(`🎬 ${spriteName}: Executing action ${i + 1}/${actions.length}`);
      
//       const currentSprite = sprites.find(s => s.id === spriteId);
//       if (currentSprite) {
//         await executeAction(currentSprite, action, setSprites, stageWidth, stageHeight);
//         await new Promise(resolve => setTimeout(resolve, 300));
        
//         setCurrentlyExecutingActions(prev => {
//           const newRemaining = (prev[spriteId] || []).slice(1);
//           return {
//             ...prev,
//             [spriteId]: newRemaining
//           };
//         });
        
//         remainingActions = remainingActions.slice(1);
//       } else {
//         addDebugLog(`❌ Sprite ${spriteName} not found`);
//         break;
//       }
//     }

//     setCurrentlyExecutingActions(prev => {
//       const newState = { ...prev };
//       delete newState[spriteId];
//       return newState;
//     });
//     addDebugLog(`✅ Finished executing actions for ${spriteName}`);
//   };

//   const handlePlay = async () => {
//     if (isPlaying) return;
    
//     setIsPlaying(true);
//     playbackRef.current = true;
//     addDebugLog(`🎬 Starting playback (Hero Feature active)...`);
    
//     try {
//       if (playForAll) {
//         const activeSprites = Object.keys(spriteActionQueues).filter(id => {
//           const actions = spriteActionQueues[id];
//           return actions && Array.isArray(actions) && actions.length > 0;
//         });
        
//         if (activeSprites.length === 0) {
//           addDebugLog(`⚠️ No sprites with actions to play`);
//           setIsPlaying(false);
//           playbackRef.current = null;
//           return;
//         }

//         // Execute all sprites simultaneously for collision opportunities
//         const promises = activeSprites.map(spriteId => {
//           const id = parseInt(spriteId);
//           return executeActionsSequentially(id, spriteActionQueues[id]);
//         });
        
//         await Promise.all(promises);
        
//       } else {
//         if (!selectedSpriteId) {
//           addDebugLog(`⚠️ No sprite selected`);
//           setIsPlaying(false);
//           playbackRef.current = null;
//           return;
//         }

//         const selectedActions = spriteActionQueues[selectedSpriteId];
//         if (!selectedActions || selectedActions.length === 0) {
//           addDebugLog(`⚠️ No actions queued for selected sprite`);
//           setIsPlaying(false);
//           playbackRef.current = null;
//           return;
//         }

//         await executeActionsSequentially(selectedSpriteId, selectedActions);
//       }
      
//     } catch (error) {
//       addDebugLog(`💥 Error during playback: ${error.message}`);
//     } finally {
//       setIsPlaying(false);
//       playbackRef.current = null;
//       setCurrentlyExecutingActions({});
//       addDebugLog(`🏁 Playback finished! Check for Hero Feature activation!`);
//     }
//   };

//   const handlePause = () => {
//     setIsPlaying(false);
//     playbackRef.current = null;
//     addDebugLog(`⏸️ Paused`);
//   };

//   const handleStop = () => {
//     setIsPlaying(false);
//     playbackRef.current = null;
//     setCurrentlyExecutingActions({});
//     setSprites(prev => prev.map(sprite => ({
//       ...sprite,
//       speech: '',
//       speechType: '',
//       hasCollided: false,
//       size: 1
//     })));
//     addDebugLog(`⏹️ Stopped and reset all sprites`);
//   };

//   const handleClearAll = () => {
//     addDebugLog(`🧹 Clearing all data...`);
    
//     setSprites([]);
//     setSpriteActionQueues({});
//     setCurrentlyExecutingActions({});
//     setSelectedSpriteId(null);
//     setSpriteIdCounter(1);
//     setIsPlaying(false);
//     setPlayForAll(true);
    
//     if (playbackRef.current) {
//       playbackRef.current = null;
//     }
    
//     setTimeout(() => {
//       setDebugLogs(['🚀 System reset! Ready for new Hero Feature demo.']);
//     }, 500);
//   };

//   // HERO FEATURE DEMO SETUP - Exactly matching challenge requirements
//   const heroFeatureDemo = () => {
//     setSprites([]);
//     setSpriteActionQueues({});
//     setSelectedSpriteId(null);
    
//     // Character 1: Move 10 steps (repeatedly moving right)
//     const character1 = {
//       id: 1,
//       name: 'Cat',
//       animalType: 'Cat',
//       x: 80,
//       y: stageHeight / 2,
//       rotation: 0,
//       size: 1,
//       visible: true,
//       speech: '',
//       speechType: '',
//       hasCollided: false,
//     };
    
//     // Character 2: Move -10 steps (repeatedly moving left)
//     const character2 = {
//       id: 2,
//       name: 'Dog',
//       animalType: 'Dog',
//       x: stageWidth - 80,
//       y: stageHeight / 2,
//       rotation: 0,
//       size: 1,
//       visible: true,
//       speech: '',
//       speechType: '',
//       hasCollided: false,
//     };
    
//     setSprites([character1, character2]);
    
//     // EXACT Challenge Example:
//     // Character 1: [Move 10 steps, repeat animation]
//     // Character 2: [Move -10 steps, repeat animation]
//     setSpriteActionQueues({
//       [character1.id]: [
//         { type: 'moveSteps', steps: 10 },
//         { type: 'repeat', times: 5, actions: [{ type: 'moveSteps', steps: 10 }] }
//       ],
//       [character2.id]: [
//         { type: 'moveSteps', steps: -10 },
//         { type: 'repeat', times: 5, actions: [{ type: 'moveSteps', steps: -10 }] }
//       ]
//     });
    
//     setSpriteIdCounter(3);
//     setSelectedSpriteId(character1.id);
//     setPlayForAll(true); // Ensure both sprites play simultaneously
    
//     addDebugLog('🎭 HERO FEATURE DEMO: Challenge Requirements Met!');
//     addDebugLog('Character 1 (Cat): Move 10 steps + repeat animation');
//     addDebugLog('Character 2 (Dog): Move -10 steps + repeat animation');
//     addDebugLog('💥 When they collide, animations will COMPLETELY SWAP!');
//     addDebugLog('🚀 Click PLAY to see the Hero Feature in action!');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-800 p-3 sm:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Animal Name Popup */}
//         <AnimatePresence>
//           <AnimalNamePopup
//             isOpen={showNamePopup}
//             onClose={handlePopupClose}
//             onConfirm={handlePopupConfirm}
//             randomAnimal={randomAnimal}
//           />
//         </AnimatePresence>

//         {/* Header - Mobile Optimized */}
//         <motion.div 
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="relative text-center mb-4 sm:mb-8"
//         >
//           <div className="absolute top-0 right-0">
//             <motion.button
//               onClick={handleClearAll}
//               className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-lg"
//               whileHover={{ scale: 1.05, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               🗑️ <span className="hidden sm:inline">Clear All</span>
//             </motion.button>
//           </div>
//           <motion.h1 
//             className="text-2xl sm:text-3xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-4 pr-16 sm:pr-0"
//           >
//             ✨ Scratch Clone with Custom Naming ✨
//           </motion.h1>
//           <motion.p 
//             className="text-gray-600 text-sm sm:text-lg lg:text-xl font-medium mb-2"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.3 }}
//           >
//             🎨 Visual Programming with Custom Named Animals + Hero Collision Feature
//           </motion.p>
//           <motion.div 
//             className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm inline-block shadow-lg"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.5 }}
//           >
//             ⭐ NEW: Custom Animal Names + Collision Animation Swap!
//           </motion.div>
//         </motion.div>

//         {/* Sprite Library - Mobile Optimized */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-4 sm:mb-8"
//         >
//           <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
//             <motion.h2 
//               className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//             >
//               🎭 Sprite Library
//               <span className="text-xs sm:text-sm font-normal bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full">
//                 {sprites.length} active
//               </span>
//             </motion.h2>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
//               {/* NEW: Add Random Animal Button */}
//               <motion.button
//                 onClick={handleAddRandomAnimal}
//                 disabled={isPlaying}
//                 className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-bold transition-all duration-300 flex flex-col items-center gap-2 sm:gap-3 shadow-2xl border-2 sm:border-3 border-green-300 ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 whileHover={isPlaying ? {} : { scale: 1.05, y: -5 }}
//                 whileTap={isPlaying ? {} : { scale: 0.95 }}
//                 initial={{ opacity: 0, scale: 0.8, y: 20 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
//               >
//                 <motion.div 
//                   className="text-2xl sm:text-4xl"
//                   animate={isPlaying ? {} : { 
//                     rotate: [0, 360]
//                   }}
//                   transition={{ 
//                     duration: 2,
//                     repeat: Infinity,
//                     ease: "easeInOut"
//                   }}
//                 >
//                   ➕
//                 </motion.div>
//                 <span className="text-center leading-tight">ADD RANDOM ANIMAL</span>
//                 <span className="text-xs opacity-80 hidden sm:block">Custom Name</span>
//               </motion.button>

//               {/* Hero Feature Demo Button */}
//               <motion.button
//                 onClick={heroFeatureDemo}
//                 disabled={isPlaying}
//                 className={`bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 hover:from-red-600 hover:via-pink-600 hover:to-purple-700 text-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-bold transition-all duration-300 flex flex-col items-center gap-2 sm:gap-3 shadow-2xl border-2 sm:border-3 border-red-300 ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 whileHover={isPlaying ? {} : { scale: 1.05, y: -5 }}
//                 whileTap={isPlaying ? {} : { scale: 0.95 }}
//                 initial={{ opacity: 0, scale: 0.8, y: 20 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
//               >
//                 <motion.div 
//                   className="text-2xl sm:text-4xl"
//                   animate={isPlaying ? {} : { 
//                     rotate: [0, 360]
//                   }}
//                   transition={{ 
//                     duration: 2,
//                     repeat: Infinity,
//                     ease: "easeInOut"
//                   }}
//                 >
//                   💥
//                 </motion.div>
//                 <span className="text-center leading-tight">HERO FEATURE DEMO</span>
//                 <span className="text-xs opacity-80 hidden sm:block">Collision Swap</span>
//               </motion.button>

//               {/* Available sprites */}
//               {availableSprites.slice(0, 2).map((spriteData, index) => {
//                 const isAlreadyAdded = sprites.some(sprite => sprite.animalType === spriteData.name);
//                 const existingSprite = sprites.find(sprite => sprite.animalType === spriteData.name);
//                 const isSelected = existingSprite && selectedSpriteId === existingSprite.id;
                
//                 return (
//                   <motion.div
//                     key={spriteData.name}
//                     className="relative"
//                     initial={{ opacity: 0, scale: 0.8, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     transition={{ delay: (index + 3) * 0.1, type: "spring", stiffness: 200, damping: 20 }}
//                   >
//                     <motion.button
//                       onClick={() => handleAddSprite(spriteData)}
//                       disabled={isPlaying}
//                       className={`${
//                         isAlreadyAdded 
//                           ? isSelected
//                             ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 text-white shadow-xl'
//                             : 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-400 text-white'
//                           : `bg-gradient-to-r ${spriteData.color} hover:shadow-xl border-gray-300 text-white hover:border-blue-400`
//                       } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''} border-2 sm:border-3 p-3 sm:p-6 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-bold transition-all duration-300 flex flex-col items-center gap-2 sm:gap-3 shadow-lg w-full relative`}
//                       whileHover={isPlaying ? {} : { scale: 1.05, y: -5 }}
//                       whileTap={isPlaying ? {} : { scale: 0.95 }}
//                     >
//                       <div className="text-2xl sm:text-4xl filter drop-shadow-lg">
//                         {spriteData.emoji}
//                       </div>
//                       <span className="font-bold text-center leading-tight">
//                         {isAlreadyAdded ? (isSelected ? '✨ Selected' : '✅ Added') : `+ ${spriteData.name}`}
//                       </span>
//                     </motion.button>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </div>
//         </motion.div>

//         {/* Show current sprites as cards */}
//         {sprites.length > 0 && (
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-4 sm:mb-8"
//           >
//             <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
//               <motion.h3 
//                 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//               >
//                 🐾 Your Sprites
//               </motion.h3>
//               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
//                 {sprites.map((sprite, index) => (
//                   <motion.div
//                     key={sprite.id}
//                     initial={{ opacity: 0, scale: 0.8, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     transition={{ delay: index * 0.1 }}
//                     className={`relative bg-white rounded-xl p-3 shadow-lg border-2 transition-all duration-300 ${
//                       selectedSpriteId === sprite.id 
//                         ? 'border-blue-400 bg-blue-50' 
//                         : 'border-gray-200 hover:border-gray-300'
//                     }`}
//                   >
//                     <motion.button
//                       onClick={() => handleSpriteSelect(sprite.id)}
//                       disabled={isPlaying}
//                       className="w-full flex flex-col items-center gap-2 group"
//                       whileHover={isPlaying ? {} : { scale: 1.05 }}
//                       whileTap={isPlaying ? {} : { scale: 0.95 }}
//                     >
//                       <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
//                         {ANIMALS_LIST[sprite.animalType]}
//                       </div>
//                       <div className="text-center">
//                         <div className="font-bold text-gray-800 text-sm truncate">
//                           {sprite.name}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {spriteActionQueues[sprite.id]?.length || 0} actions
//                         </div>
//                       </div>
//                     </motion.button>
                    
//                     {/* Remove button */}
//                     <motion.button
//                       onClick={() => handleRemoveSprite(sprite.id)}
//                       disabled={isPlaying}
//                       className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full text-sm flex items-center justify-center shadow-lg font-bold border-2 border-white"
//                       whileHover={isPlaying ? {} : { scale: 1.15, rotate: 90 }}
//                       whileTap={isPlaying ? {} : { scale: 0.9 }}
//                     >
//                       ×
//                     </motion.button>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* Main Content - Responsive Layout */}
//         <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8'} mb-4 sm:mb-8`}>
//           {/* Left Panel - Code Area */}
//           <motion.div 
//             initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.2 }}
//             className="space-y-3 sm:space-y-6"
//           >
//             {/* Motion Blocks */}
//             <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl">
//               <motion.h3 
//                 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3"
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//               >
//                 🏃‍♂️ Motion Blocks
//               </motion.h3>
//               <div className="max-h-48 sm:max-h-64 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
//                 <MotionBlocks isPlaying={isPlaying} />
//               </div>
//             </div>

//             {/* Looks Blocks */}
//             <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl">
//               <motion.h3 
//                 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3"
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//               >
//                 🎨 Looks Blocks
//               </motion.h3>
//               <div className="max-h-48 sm:max-h-64 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
//                 <LooksBlocks isPlaying={isPlaying} />
//               </div>
//             </div>

//             {/* Code Area */}
//             <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
//               <CodeArea
//                 spriteActions={spriteActionQueues}
//                 selectedSpriteId={selectedSpriteId}
//                 sprites={sprites}
//                 onAddAction={handleAddAction}
//                 onRemoveAction={handleRemoveAction}
//                 onClearAllActions={handleClearAllActions}
//                 isPlaying={isPlaying}
//               />
//             </div>
//           </motion.div>

//           {/* Right Panel - Stage & Controls */}
//           <motion.div 
//             initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: isMobile ? 0.2 : 0.4 }}
//             className="space-y-3 sm:space-y-6"
//           >
//             {/* Stage - Responsive */}
//             <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl">
//               <motion.h3 
//                 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3"
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//               >
//                 🎪 Performance Stage
//                 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-normal">
//                   {sprites.length} sprites
//                 </span>
//               </motion.h3>
//               <div className="flex justify-center">
//                 <Stage
//                   sprites={sprites}
//                   selectedSpriteId={selectedSpriteId}
//                   onSpriteSelect={handleSpriteSelect}
//                   onSpriteMove={handleSpriteMove}
//                   onSpriteRemove={handleRemoveSprite}
//                   stageWidth={stageWidth}
//                   stageHeight={stageHeight}
//                   isPlaying={isPlaying}
//                 />
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl">
//               <motion.h3 
//                 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3"
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//               >
//                 🎮 Control Center
//               </motion.h3>
//               <PlaybackControls
//                 onPlay={handlePlay}
//                 onPause={handlePause}
//                 onStop={handleStop}
//                 onRemoveSprite={handleRemoveSprite}
//                 isPlaying={isPlaying}
//                 selectedSpriteId={selectedSpriteId}
//                 sprites={sprites}
//                 spriteActions={spriteActionQueues}
//                 playForAll={playForAll}
//                 setPlayForAll={setPlayForAll}
//               />
//             </div>
//           </motion.div>
//         </div>

//         {/* Event Log - Mobile Optimized */}
//         <motion.div 
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5 }}
//         >
//           <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
//               <motion.h3 
//                 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//               >
//                 📋 Event Log
//                 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">
//                   Custom Names + Hero Feature
//                 </span>
//               </motion.h3>
//               <motion.button
//                 onClick={() => setDebugLogs([])}
//                 className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl font-medium shadow-lg transition-all duration-300 text-xs sm:text-sm"
//                 whileHover={{ scale: 1.05, y: -2 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 🧹 Clear
//               </motion.button>
//             </div>
//             <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-6 border-2 border-gray-700 shadow-inner">
//               <div className="text-xs sm:text-sm max-h-32 sm:max-h-40 overflow-y-auto space-y-2 sm:space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
//                 <AnimatePresence>
//                   {debugLogs.length === 0 ? (
//                     <motion.p 
//                       className="text-green-400 font-mono flex items-center gap-2"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                     >
//                       <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
//                       <span className="text-xs sm:text-sm">
//                         🚀 Custom Animal Naming System Ready!
//                         <br />
//                         <span className="text-yellow-400">➕ Click the green "ADD RANDOM ANIMAL" button to get a random animal and set its custom name!</span>
//                         <br />
//                         <span className="text-cyan-400">🎭 Each animal can be programmed independently with motion and looks blocks!</span>
//                         <br />
//                         <span className="text-pink-400">💥 Hero Feature: When sprites collide, they swap their complete animation sequences!</span>
//                       </span>
//                     </motion.p>
//                   ) : (
//                     debugLogs.map((log, index) => (
//                       <motion.div
//                         key={index}
//                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                         className="text-cyan-300 bg-gray-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl font-mono text-xs border border-cyan-500/20 shadow-lg flex items-start gap-2"
//                       >
//                         <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1"></span>
//                         <span className="break-words">{log}</span>
//                       </motion.div>
//                     ))
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

// // Export the component wrapped with DndProvider
// export default function ScratchClone() {
//   return (
//     <DndProvider backend={HTML5Backend}>
//       <ScratchCloneMain />
//     </DndProvider>
//   );
// }