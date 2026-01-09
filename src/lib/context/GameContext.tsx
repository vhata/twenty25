'use client'

/**
 * Game State Context
 *
 * Provides centralized state management for the card categorization game.
 * Uses React Context + useReducer for predictable state updates.
 */

import { canAddCardToPile, getCategoryName, isPileComplete } from '@/lib/game-utils'
import type { Category, GameAction, GameData, GameState } from '@/lib/types/game'
import { type ReactNode, createContext, useContext, useMemo, useReducer } from 'react'

/**
 * Game reducer - handles all state mutations.
 * Implements the core game logic including validation and pile management.
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CREATE_PILE': {
      // Create a new pile with two cards
      const { card1Id, card2Id } = action

      // Find the cards
      const card1 = state.cards.find((c) => c.id === card1Id)
      const card2 = state.cards.find((c) => c.id === card2Id)

      if (!card1 || !card2) {
        console.error('Cannot create pile: cards not found')
        return state
      }

      // Validate that both cards are from the same category
      if (card1.categoryId !== card2.categoryId) {
        // This should trigger INCREMENT_MISTAKES instead
        console.error('Cannot create pile: cards from different categories')
        return state
      }

      // Generate a unique pile ID
      const pileId = `pile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create the new pile
      const newPile = {
        id: pileId,
        cardIds: [card1Id, card2Id],
        isComplete: false,
        revealedCategoryName: null,
      }

      return {
        ...state,
        piles: [...state.piles, newPile],
      }
    }

    case 'ADD_CARD_TO_PILE': {
      const { cardId, pileId, categoryName } = action

      // Find the pile
      const pileIndex = state.piles.findIndex((p) => p.id === pileId)
      if (pileIndex === -1) {
        console.error('Cannot add card: pile not found')
        return state
      }

      const pile = state.piles[pileIndex]

      // Add card to pile
      const updatedPile = {
        ...pile,
        cardIds: [...pile.cardIds, cardId],
      }

      // Check if pile is now complete
      if (isPileComplete(updatedPile)) {
        updatedPile.isComplete = true
        updatedPile.revealedCategoryName = categoryName || null
      }

      // Update piles array
      const newPiles = [...state.piles]
      newPiles[pileIndex] = updatedPile

      // Update completed count if pile just completed
      const newCompletedCount =
        updatedPile.isComplete && !pile.isComplete ? state.completedCount + 1 : state.completedCount

      return {
        ...state,
        piles: newPiles,
        completedCount: newCompletedCount,
      }
    }

    case 'SPLIT_PILE': {
      const { pileId } = action

      // Remove the pile from state (cards go back to ungrouped)
      return {
        ...state,
        piles: state.piles.filter((p) => p.id !== pileId),
        // If the pile was complete, decrement completed count
        completedCount: state.piles.find((p) => p.id === pileId)?.isComplete
          ? state.completedCount - 1
          : state.completedCount,
      }
    }

    case 'INCREMENT_MISTAKES': {
      return {
        ...state,
        mistakes: state.mistakes + 1,
      }
    }

    case 'RESET_GAME': {
      // Reset to initial state (will be handled by re-initializing)
      return {
        cards: state.cards, // Keep the shuffled cards
        piles: [],
        mistakes: 0,
        completedCount: 0,
      }
    }

    default:
      return state
  }
}

/**
 * Context value type
 */
interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  categories: Category[]
  // Helper function to attempt adding a card to a pile with validation
  tryAddCardToPile: (cardId: string, pileId: string) => boolean
  // Helper function to attempt creating a pile with validation
  tryCreatePile: (card1Id: string, card2Id: string) => boolean
}

const GameContext = createContext<GameContextValue | null>(null)

/**
 * Game Provider Props
 */
interface GameProviderProps {
  children: ReactNode
  initialData: GameData
}

/**
 * Game Provider Component
 * Wraps the game UI and provides state management via context.
 */
export function GameProvider({ children, initialData }: GameProviderProps) {
  // Initialize state from loaded data
  const initialState: GameState = useMemo(
    () => ({
      cards: initialData.cards,
      piles: [],
      mistakes: 0,
      completedCount: 0,
    }),
    [initialData.cards]
  )

  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Helper function to try adding a card to a pile with validation
  const tryAddCardToPile = useMemo(
    () =>
      (cardId: string, pileId: string): boolean => {
        const card = state.cards.find((c) => c.id === cardId)
        const pile = state.piles.find((p) => p.id === pileId)

        if (!card || !pile) {
          return false
        }

        // Don't allow adding to completed piles
        if (pile.isComplete) {
          return false
        }

        // Validate the move
        if (!canAddCardToPile(card, pile, state.cards)) {
          dispatch({ type: 'INCREMENT_MISTAKES' })
          return false
        }

        // Check if this will complete the pile
        const willComplete = pile.cardIds.length + 1 === 45
        const categoryName = willComplete
          ? getCategoryName(card.categoryId, initialData.categories)
          : undefined

        // Valid move - dispatch action
        dispatch({
          type: 'ADD_CARD_TO_PILE',
          cardId,
          pileId,
          categoryName: categoryName || undefined,
        })
        return true
      },
    [state.cards, state.piles, initialData.categories]
  )

  // Helper function to try creating a pile with validation
  const tryCreatePile = useMemo(
    () =>
      (card1Id: string, card2Id: string): boolean => {
        const card1 = state.cards.find((c) => c.id === card1Id)
        const card2 = state.cards.find((c) => c.id === card2Id)

        if (!card1 || !card2) {
          return false
        }

        // Validate that both cards are from same category
        if (card1.categoryId !== card2.categoryId) {
          dispatch({ type: 'INCREMENT_MISTAKES' })
          return false
        }

        // Valid move - create pile
        dispatch({ type: 'CREATE_PILE', card1Id, card2Id })
        return true
      },
    [state.cards]
  )

  const value = useMemo(
    () => ({
      state,
      dispatch,
      categories: initialData.categories,
      tryAddCardToPile,
      tryCreatePile,
    }),
    [state, initialData.categories, tryAddCardToPile, tryCreatePile]
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

/**
 * Custom hook to access game context.
 * Must be used within a GameProvider.
 */
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
