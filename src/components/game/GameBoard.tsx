'use client'

/**
 * GameBoard Component
 *
 * Main game board that integrates drag-and-drop functionality.
 * Handles card dragging, pile creation, and move validation.
 */

import { useGame } from '@/lib/context/GameContext'
import { getPileCards, getUngroupedCards } from '@/lib/game-utils'
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { useState } from 'react'
import { Card } from './Card'
import { CardGrid } from './CardGrid'
import { Pile } from './Pile'

/**
 * Draggable Card Wrapper
 */
function DraggableCard({
  id,
  title,
  isInPile,
  pileColor,
}: {
  id: string
  title: string
  isInPile: boolean
  pileColor?: string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card
        id={id}
        title={title}
        isDragging={isDragging}
        isInPile={isInPile}
        pileColor={pileColor}
      />
    </div>
  )
}

/**
 * Droppable Card (for creating piles)
 */
function DroppableCard({ id, title }: { id: string; title: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `card-drop-${id}`,
  })

  return (
    <div ref={setNodeRef} className={isOver ? 'ring-2 ring-blue-500 rounded-lg' : ''}>
      <DraggableCard id={id} title={title} isInPile={false} />
    </div>
  )
}

/**
 * Droppable Pile
 */
function DroppablePile({
  pile,
  cards,
}: {
  pile: { id: string; cardIds: string[]; isComplete: boolean; revealedCategoryName: string | null }
  cards: Array<{ id: string; title: string }>
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `pile-drop-${pile.id}`,
    disabled: pile.isComplete,
  })

  return (
    <div ref={setNodeRef}>
      <Pile
        id={pile.id}
        cards={cards}
        cardCount={pile.cardIds.length}
        isComplete={pile.isComplete}
        revealedCategoryName={pile.revealedCategoryName}
        isDraggingOver={isOver && !pile.isComplete}
      />
    </div>
  )
}

export function GameBoard() {
  const { state, tryCreatePile, tryAddCardToPile, categories } = useGame()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const ungroupedCards = getUngroupedCards(state)

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
    setFeedbackMessage(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const draggedCardId = active.id as string
    const dropTargetId = over.id as string

    // Check if dropped on a card (to create a pile)
    if (dropTargetId.startsWith('card-drop-')) {
      const targetCardId = dropTargetId.replace('card-drop-', '')
      const success = tryCreatePile(draggedCardId, targetCardId)

      if (!success) {
        setFeedbackMessage("Cards don't belong together!")
        setTimeout(() => setFeedbackMessage(null), 2000)
      }
    }
    // Check if dropped on a pile
    else if (dropTargetId.startsWith('pile-drop-')) {
      const targetPileId = dropTargetId.replace('pile-drop-', '')
      const success = tryAddCardToPile(draggedCardId, targetPileId)

      if (!success) {
        setFeedbackMessage("Card doesn't belong in this pile!")
        setTimeout(() => setFeedbackMessage(null), 2000)
      }
    }
  }

  const activeCard = activeId ? state.cards.find((c) => c.id === activeId) : null

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {feedbackMessage}
        </div>
      )}

      {/* Ungrouped Cards */}
      <div className="mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Ungrouped Cards</h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">{ungroupedCards.length}</span> cards remaining
              <span className="text-gray-400 ml-2">
                ({state.cards.length - ungroupedCards.length} grouped)
              </span>
            </p>
          </div>

          {ungroupedCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500 mb-2">All cards have been grouped!</p>
              <p className="text-sm text-gray-400">
                Continue working on your piles to complete the game.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {ungroupedCards.map((card) => (
                <DroppableCard key={card.id} id={card.id} title={card.title} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Piles */}
      {state.piles.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Piles ({state.piles.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.piles.map((pile) => {
              const cards = getPileCards(pile.id, state)
              return <DroppablePile key={pile.id} pile={pile} cards={cards} />
            })}
          </div>
        </div>
      )}

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard ? (
          <Card id={activeCard.id} title={activeCard.title} isDragging={true} isInPile={false} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
