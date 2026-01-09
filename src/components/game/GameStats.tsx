'use client'

/**
 * GameStats Component
 *
 * Displays game statistics including mistakes, completed piles, and progress.
 */

import { useGame } from '@/lib/context/GameContext'

export function GameStats() {
  const { state } = useGame()

  const ungroupedCount = state.cards.filter(
    (card) => !state.piles.some((pile) => pile.cardIds.includes(card.id))
  ).length

  const groupedCount = state.cards.length - ungroupedCount
  const completionPercentage = Math.round(((state.completedCount * 45) / state.cards.length) * 100)

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{state.mistakes}</div>
          <div className="text-sm text-gray-600 mt-1">Mistakes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{state.completedCount}/45</div>
          <div className="text-sm text-gray-600 mt-1">Complete</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{groupedCount}</div>
          <div className="text-sm text-gray-600 mt-1">Grouped</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{completionPercentage}%</div>
          <div className="text-sm text-gray-600 mt-1">Progress</div>
        </div>
      </div>
    </div>
  )
}
