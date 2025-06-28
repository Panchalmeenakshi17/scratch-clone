export default function SpriteManager({ 
  sprites, 
  selectedSpriteId, 
  onSpriteSelect, 
  onAddSprite, 
  onDeleteSprite 
}) {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Sprites</h3>
        <button
          onClick={onAddSprite}
          className="bg-scratch-blue text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          + Add Sprite
        </button>
      </div>
      
      <div className="space-y-2">
        {sprites.map(sprite => (
          <div
            key={sprite.id}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
              sprite.id === selectedSpriteId
                ? 'border-scratch-blue bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => onSpriteSelect(sprite.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: sprite.color }}
                >
                  {sprite.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{sprite.name}</div>
                  <div className="text-xs text-gray-500">
                    x: {Math.round(sprite.x)}, y: {Math.round(sprite.y)}
                  </div>
                </div>
              </div>
              
              {sprites.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSprite(sprite.id)
                  }}
                  className="text-red-500 hover:text-red-700 text-sm p-1"
                  title="Delete Sprite"
                >
                  🗑️
                </button>
              )}
            </div>
            
            {/* Show animation count */}
            <div className="mt-2 text-xs text-gray-500">
              {sprite.animations.length} animation{sprite.animations.length !== 1 ? 's' : ''}
              {sprite.animations.length > 0 && (
                <div className="mt-1">
                  {sprite.animations.slice(0, 2).map((anim, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 rounded px-1 py-0.5 mr-1 text-xs"
                    >
                      {anim.type}
                    </span>
                  ))}
                  {sprite.animations.length > 2 && (
                    <span className="text-gray-400">+{sprite.animations.length - 2} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Hero Feature Info */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm font-semibold text-yellow-800 mb-1">
          🦸‍♂️ Hero Feature Active
        </div>
        <div className="text-xs text-yellow-700">
          When sprites collide during animation, their animation sequences will swap automatically!
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600">
          <p className="font-semibold mb-1">Quick Tips:</p>
          <p>• Click a sprite to select it</p>
          <p>• Drag blocks to create animations</p>
          <p>• Use repeat blocks for loops</p>
          <p>• Press Play to see magic happen!</p>
        </div>
      </div>
    </div>
  )
}