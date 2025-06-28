import { useEffect, useRef } from 'react';

/**
 * Custom hook for detecting collisions between sprites using precise coordinates
 * Similar to lat/long tracking but for x/y positions on the stage
 */
const useCollisionDetection = (sprites, onCollision) => {
  const lastCollisionTime = useRef(new Map());
  const COLLISION_COOLDOWN = 3000; // 3 seconds between same pair collisions

  useEffect(() => {
    // Only check collisions if we have 2 or more sprites
    if (sprites.length < 2) return;

    const checkCollisions = () => {
      const currentTime = Date.now();

      // Check every pair of sprites for collision
      for (let i = 0; i < sprites.length; i++) {
        for (let j = i + 1; j < sprites.length; j++) {
          const sprite1 = sprites[i];
          const sprite2 = sprites[j];

          // Skip if either sprite is invisible
          if (!sprite1.visible || !sprite2.visible) continue;

          // Calculate collision using coordinates (like lat/long distance)
          const collision = detectCollisionByCoordinates(sprite1, sprite2);
          
          if (collision.isColliding) {
            const pairKey = `${Math.min(sprite1.id, sprite2.id)}-${Math.max(sprite1.id, sprite2.id)}`;
            const lastCollision = lastCollisionTime.current.get(pairKey) || 0;
            
            // Only trigger if enough time has passed since last collision
            if (currentTime - lastCollision > COLLISION_COOLDOWN) {
              console.log(`🎯 COLLISION DETECTED:`, {
                sprite1: { id: sprite1.id, name: sprite1.name, x: sprite1.x, y: sprite1.y },
                sprite2: { id: sprite2.id, name: sprite2.name, x: sprite2.x, y: sprite2.y },
                distance: collision.distance.toFixed(2),
                timestamp: new Date().toLocaleTimeString()
              });
              
              lastCollisionTime.current.set(pairKey, currentTime);
              onCollision(sprite1.id, sprite2.id);
            }
          }
        }
      }
    };

    // Check for collisions continuously
    const interval = setInterval(checkCollisions, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [sprites, onCollision]);
};

/**
 * Detects collision between two sprites using their coordinates
 * Like checking if two GPS points are close enough to each other
 */
const detectCollisionByCoordinates = (sprite1, sprite2) => {
  // Get sprite centers (accounting for their size)
  const sprite1Center = {
    x: sprite1.x,
    y: sprite1.y
  };
  
  const sprite2Center = {
    x: sprite2.x,
    y: sprite2.y
  };

  // Calculate distance between centers (Pythagorean theorem)
  // Like calculating distance between two lat/long points
  const deltaX = sprite1Center.x - sprite2Center.x;
  const deltaY = sprite1Center.y - sprite2Center.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Define collision radius based on sprite sizes
  // Larger sprites have bigger collision areas
  const sprite1Radius = (sprite1.size || 1) * 25; // Base radius 25px
  const sprite2Radius = (sprite2.size || 1) * 25;
  const collisionThreshold = sprite1Radius + sprite2Radius;

  return {
    isColliding: distance <= collisionThreshold,
    distance: distance,
    threshold: collisionThreshold,
    coordinates: {
      sprite1: sprite1Center,
      sprite2: sprite2Center
    }
  };
};

/**
 * Alternative: More precise bounding box collision detection
 * Like checking if two rectangular GPS areas overlap
 * Updated for 600x420 stage dimensions
 */
const detectBoundingBoxCollision = (sprite1, sprite2) => {
  const getSpriteBounds = (sprite) => {
    const size = (sprite.size || 1) * 50; // Base size 50px
    return {
      left: Math.max(0, sprite.x - size/2),
      right: Math.min(600, sprite.x + size/2), // 600px stage width
      top: Math.max(0, sprite.y - size/2),
      bottom: Math.min(420, sprite.y + size/2) // 420px stage height
    };
  };

  const bounds1 = getSpriteBounds(sprite1);
  const bounds2 = getSpriteBounds(sprite2);

  // Check if rectangles overlap (all conditions must be true)
  const isOverlapping = 
    bounds1.left < bounds2.right &&    // sprite1's left edge is left of sprite2's right edge
    bounds1.right > bounds2.left &&    // sprite1's right edge is right of sprite2's left edge
    bounds1.top < bounds2.bottom &&    // sprite1's top edge is above sprite2's bottom edge
    bounds1.bottom > bounds2.top;      // sprite1's bottom edge is below sprite2's top edge

  return {
    isColliding: isOverlapping,
    bounds1,
    bounds2
  };
};

/**
 * GPS-style distance calculation (for reference)
 * This is how you'd calculate distance between actual lat/long coordinates
 */
const calculateGPSDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

export default useCollisionDetection;