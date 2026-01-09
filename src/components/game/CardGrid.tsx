'use client'

/**
 * CardGrid Component
 *
 * Displays all ungrouped cards in a responsive grid layout.
 * Shows cards that haven't been added to any pile yet.
 */

import { Card } from './Card'

interface CardGridProps {
  cards: Array<{ id: string; title: string }>
  totalCards: number
}

export function CardGrid({ cards, totalCards }: CardGridProps) {
  const ungroupedCount = cards.length
  const groupedCount = totalCards - ungroupedCount

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300 mb-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Ungrouped Cards</h2>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-semibold">{ungroupedCount}</span> cards remaining
          <span className="text-gray-400 ml-2">({groupedCount} grouped)</span>
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 mb-2">All cards have been grouped!</p>
          <p className="text-sm text-gray-400">
            Continue working on your piles to complete the game.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {cards.map((card) => (
            <Card key={card.id} id={card.id} title={card.title} isInPile={false} />
          ))}
        </div>
      )}
    </div>
  )
}
