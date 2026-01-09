'use client'

/**
 * Pile Component
 *
 * Displays a stack of grouped cards with count and completion status.
 * Shows revealed category name when pile is complete (45 cards).
 */

import { Card } from './Card'

/**
 * Strips parenthetical disambiguations from Wikipedia titles
 * e.g., "Phenomenology (philosophy)" → "Phenomenology"
 */
function stripParenthetical(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/g, '').trim()
}

interface PileProps {
  id: string
  cards: Array<{ id: string; title: string }>
  cardCount: number
  isComplete: boolean
  revealedCategoryName: string | null
  isDraggingOver?: boolean
}

export function Pile({
  id,
  cards,
  cardCount,
  isComplete,
  revealedCategoryName,
  isDraggingOver = false,
}: PileProps) {
  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 min-h-[200px]
        ${isComplete ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}
        ${isDraggingOver && !isComplete ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : ''}
        transition-all duration-200
      `}
      data-pile-id={id}
    >
      {/* Pile Header */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        {isComplete && revealedCategoryName ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <h3 className="text-lg font-bold text-green-700">
                {stripParenthetical(revealedCategoryName)}
              </h3>
            </div>
            <p className="text-xs text-green-600 font-medium">Complete!</p>
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-700">Pile</h3>
            <p className="text-sm text-gray-600">
              <span className="font-bold text-lg">{cardCount}</span>
              <span className="text-gray-500"> / 45 cards</span>
            </p>
          </div>
        )}
      </div>

      {/* Cards in Pile */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {cards.length === 0 ? (
          <div className="text-center py-8 text-gray-400 italic">Pile is empty</div>
        ) : (
          cards.map((card) => (
            <Card key={card.id} id={card.id} title={card.title} isInPile={true} pileColor={id} />
          ))
        )}
      </div>

      {/* Complete Pile Lock Indicator */}
      {isComplete && (
        <div className="absolute top-2 right-2">
          <span className="text-xl" title="Pile is locked">
            🔒
          </span>
        </div>
      )}

      {/* Drag Over Indicator */}
      {isDraggingOver && !isComplete && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-50 rounded-xl pointer-events-none">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
            Drop here to add card
          </div>
        </div>
      )}
    </div>
  )
}
