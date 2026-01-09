'use client'

/**
 * GameControls Component
 *
 * Provides game controls including reset and help.
 */

import { useGame } from '@/lib/context/GameContext'
import { useState } from 'react'

export function GameControls() {
  const { dispatch } = useGame()
  const [showHelp, setShowHelp] = useState(false)

  function handleReset() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      dispatch({ type: 'RESET_GAME' })
    }
  }

  return (
    <>
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md"
        >
          Reset Game
        </button>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        >
          How to Play
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelp(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowHelp(false)}
        >
          <div
            className="bg-white p-8 rounded-xl max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800">How to Play</h2>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-2">Goal</h3>
                <p>
                  Group all 2025 cards into 45 categories. Each category has exactly 45 cards that
                  belong together. The challenge? You don't know the categories - you must discover
                  them!
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">How It Works</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Drag a card onto another card to start a new pile</li>
                  <li>Drag cards onto existing piles to add them</li>
                  <li>
                    If cards don't belong together, the move will be rejected and count as a mistake
                  </li>
                  <li>
                    When a pile reaches 45 cards, it's complete and the category name is revealed!
                  </li>
                  <li>Complete piles are locked - no more cards can be added</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Tips</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Start with cards that seem obviously related</li>
                  <li>Pay attention to rejection feedback - it tells you when cards don't match</li>
                  <li>Try to minimize mistakes for a better score!</li>
                  <li>Once you discover a category, you'll know which cards belong to it</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
