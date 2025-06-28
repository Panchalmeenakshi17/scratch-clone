export const spriteActions = {
  moveRight: (sprite) => ({ ...sprite, x: Math.min(440, sprite.x + 20) }),
  moveLeft: (sprite) => ({ ...sprite, x: Math.max(0, sprite.x - 20) }),
  turnRight: (sprite) => ({ ...sprite, rotation: sprite.rotation + 15 }),
  turnLeft: (sprite) => ({ ...sprite, rotation: sprite.rotation - 15 }),
  spin360: (sprite) => ({ ...sprite, rotation: sprite.rotation + 360 }),
  sayHello: (sprite) => ({ ...sprite, speech: 'Hello World!' }),
  sayCustom: (sprite) => ({ ...sprite, speech: "I'm awesome!" }),
  hide: (sprite) => ({ ...sprite, visible: false }),
  show: (sprite) => ({ ...sprite, visible: true }),
};

export const getSpriteEmoji = (name, isCollided) => {
  if (isCollided) {
    return name === 'Cat' ? '😸' : name === 'Dog' ? '😄' : '⭐';
  }
  return name === 'Cat' ? '🐱' : name === 'Dog' ? '🐶' : '⚽';
};

export const clearSpeechAfterDelay = (setSprites, spriteId, delay = 2000) => {
  setTimeout(() => {
    setSprites(prev => prev.map(s => 
      s.id === spriteId ? { ...s, speech: '' } : s
    ));
  }, delay);
};

export const executeAction = (sprite, action, setSprites) => {
  return new Promise((resolve) => {
    const updatedSprite = spriteActions[action](sprite);
    
    // Update the sprite immediately
    setSprites(prev => prev.map(s => 
      s.id === sprite.id ? updatedSprite : s
    ));
    
    // Handle speech actions with auto-clear
    if (action === 'sayHello' || action === 'sayCustom') {
      setTimeout(() => {
        setSprites(prev => prev.map(s => 
          s.id === sprite.id ? { ...s, speech: '' } : s
        ));
        resolve();
      }, 2000);
    } else {
      resolve();
    }
  });
};

export const getActionLabel = (action) => {
  const labels = {
    moveRight: 'Move Right 20px',
    moveLeft: 'Move Left 20px', 
    turnRight: 'Turn Right 15°',
    turnLeft: 'Turn Left 15°',
    spin360: 'Spin 360° (Full Circle)',
    sayHello: 'Say "Hello World!"',
    sayCustom: 'Say "I\'m awesome!"',
    hide: 'Hide Sprite',
    show: 'Show Sprite'
  };
  return labels[action] || action;
};