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
  MouseSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
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
  isSelected,
  onClick,
}: {
  id: string
  title: string
  isInPile: boolean
  pileColor?: string
  isSelected?: boolean
  onClick?: () => void
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
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Only trigger onClick if not dragging
        if (!isDragging && onClick) {
          e.stopPropagation()
          onClick()
        }
      }}
      className={isSelected ? 'ring-4 ring-green-500 rounded-lg' : ''}
    >
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
function DroppableCard({
  id,
  title,
  isSelected,
  onClick,
}: {
  id: string
  title: string
  isSelected?: boolean
  onClick?: () => void
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `card-drop-${id}`,
  })

  return (
    <div ref={setNodeRef} className={isOver ? 'ring-2 ring-blue-500 rounded-lg' : ''}>
      <DraggableCard
        id={id}
        title={title}
        isInPile={false}
        isSelected={isSelected}
        onClick={onClick}
      />
    </div>
  )
}

/**
 * Droppable Pile
 */
function DroppablePile({
  pile,
  cards,
  onClick,
}: {
  pile: { id: string; cardIds: string[]; isComplete: boolean; revealedCategoryName: string | null }
  cards: Array<{ id: string; title: string }>
  onClick?: () => void
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `pile-drop-${pile.id}`,
    disabled: pile.isComplete,
  })

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={onClick && !pile.isComplete ? 0 : undefined}
      className={onClick && !pile.isComplete ? 'cursor-pointer' : ''}
    >
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
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])

  // Configure sensors for mouse, touch, and pointer interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start drag
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch to distinguish from scrolling
        tolerance: 8,
      },
    })
  )

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

      // Prevent dropping a card on itself
      if (draggedCardId === targetCardId) {
        return
      }

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

  // Handle card click for multi-select interface
  function handleCardClick(cardId: string) {
    // If card is already selected, deselect it
    if (selectedCardIds.includes(cardId)) {
      setSelectedCardIds(selectedCardIds.filter((id) => id !== cardId))
      setFeedbackMessage(null)
      return
    }

    // Add card to selection
    const newSelection = [...selectedCardIds, cardId]
    setSelectedCardIds(newSelection)

    // Auto-submit when exactly 2 cards are selected
    if (newSelection.length === 2) {
      // Short delay to show the selection before submitting
      setTimeout(() => {
        handleCreatePileFromSelected(newSelection)
      }, 300)
      setFeedbackMessage('Creating pile from 2 cards...')
      return
    }

    if (newSelection.length === 1) {
      setFeedbackMessage('Card selected. Click one more card to create a pile.')
      setTimeout(() => setFeedbackMessage(null), 3000)
    } else {
      setFeedbackMessage(`${newSelection.length} cards selected. Click "Create Pile" button below.`)
      setTimeout(() => setFeedbackMessage(null), 3000)
    }
  }

  // Create pile from all selected cards
  function handleCreatePileFromSelected(cardsToGroup?: string[]) {
    const cards = cardsToGroup || selectedCardIds

    if (cards.length < 2) {
      setFeedbackMessage('Select at least 2 cards to create a pile')
      setTimeout(() => setFeedbackMessage(null), 2000)
      return
    }

    // Start with first two cards
    const [first, second, ...rest] = cards
    const success = tryCreatePile(first, second)

    if (!success) {
      setFeedbackMessage("Cards don't belong together!")
      setTimeout(() => setFeedbackMessage(null), 2000)
      setSelectedCardIds([])
      return
    }

    // Find the pile that was just created
    const newPile = state.piles[state.piles.length - 1]

    // Try to add remaining cards to the pile
    let failedCards = 0
    for (const cardId of rest) {
      const addSuccess = tryAddCardToPile(cardId, newPile.id)
      if (!addSuccess) {
        failedCards++
      }
    }

    setSelectedCardIds([])

    if (failedCards > 0) {
      setFeedbackMessage(`Pile created! ${failedCards} card(s) didn't match and were not added.`)
      setTimeout(() => setFeedbackMessage(null), 3000)
    } else {
      setFeedbackMessage('Pile created successfully!')
      setTimeout(() => setFeedbackMessage(null), 2000)
    }
  }

  // Handle pile click for adding selected cards to pile
  function handlePileClick(pileId: string) {
    if (selectedCardIds.length === 0) {
      setFeedbackMessage('Select cards first, then click a pile to add them.')
      setTimeout(() => setFeedbackMessage(null), 2000)
      return
    }

    // Try to add all selected cards to the pile
    let successCount = 0
    let failCount = 0

    for (const cardId of selectedCardIds) {
      const success = tryAddCardToPile(cardId, pileId)
      if (success) {
        successCount++
      } else {
        failCount++
      }
    }

    setSelectedCardIds([])

    if (failCount > 0 && successCount > 0) {
      setFeedbackMessage(`Added ${successCount} card(s). ${failCount} didn't match.`)
      setTimeout(() => setFeedbackMessage(null), 3000)
    } else if (failCount > 0) {
      setFeedbackMessage("Cards don't belong in this pile!")
      setTimeout(() => setFeedbackMessage(null), 2000)
    } else {
      setFeedbackMessage(`Added ${successCount} card(s) to pile`)
      setTimeout(() => setFeedbackMessage(null), 2000)
    }
  }

  const activeCard = activeId ? state.cards.find((c) => c.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Instructions Banner */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-800">
          <strong>How to play:</strong> Click any 2 cards to instantly create a pile. For 3+ cards,
          click to select them, then use the "Create Pile" button. Or drag and drop cards to group
          them.
        </p>
      </div>

      {/* Create Pile Button - Only show for 3+ cards (2 cards auto-submit) */}
      {selectedCardIds.length >= 3 && (
        <div className="mb-4 flex justify-center">
          <button
            type="button"
            onClick={() => handleCreatePileFromSelected()}
            className="px-10 py-4 bg-green-500 text-white font-bold text-lg rounded-lg hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl animate-pulse"
          >
            Create Pile from {selectedCardIds.length} Selected Cards
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            feedbackMessage.includes('selected') || feedbackMessage.includes('Select')
              ? 'bg-blue-500'
              : 'bg-red-500'
          } text-white ${feedbackMessage.includes('selected') ? '' : 'animate-bounce'}`}
        >
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
                <DroppableCard
                  key={card.id}
                  id={card.id}
                  title={card.title}
                  isSelected={selectedCardIds.includes(card.id)}
                  onClick={() => handleCardClick(card.id)}
                />
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
              return (
                <DroppablePile
                  key={pile.id}
                  pile={pile}
                  cards={cards}
                  onClick={() => handlePileClick(pile.id)}
                />
              )
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
