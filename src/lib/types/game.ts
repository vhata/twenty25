/**
 * Card Categorization Game - Type Definitions
 *
 * This file defines all TypeScript interfaces and types for the game state,
 * data structures, and actions.
 */

/**
 * A single card in the game.
 * Each card belongs to a category (categoryId), but this is hidden from the user
 * until they successfully complete a pile.
 */
export interface Card {
  id: string
  title: string
  categoryId: string // Hidden from user - used for validation
}

/**
 * Category metadata from YAML file.
 * Used to load data and reveal names when piles are completed.
 */
export interface Category {
  id: string
  name: string
}

/**
 * A pile of cards that the user has grouped together.
 * When a pile reaches 45 cards all from the same category, it becomes complete
 * and the category name is revealed.
 */
export interface Pile {
  id: string
  cardIds: string[] // IDs of cards in this pile
  isComplete: boolean // True when 45 cards, all same category
  revealedCategoryName: string | null // Shown only when isComplete = true
}

/**
 * The raw data loaded from YAML file.
 * Contains all categories and their cards.
 */
export interface GameData {
  categories: Category[]
  cards: Card[] // Flat list of all cards (2025 total)
}

/**
 * The complete game state managed by the reducer.
 * This represents all mutable state during gameplay.
 */
export interface GameState {
  cards: Card[] // All cards in the game
  piles: Pile[] // All piles created by the user
  mistakes: number // Count of rejected moves (validation failures)
  completedCount: number // Number of completed piles
}

/**
 * Actions that can be dispatched to modify game state.
 * Processed by gameReducer in GameContext.
 */
export type GameAction =
  | {
      type: 'CREATE_PILE'
      card1Id: string
      card2Id: string
    }
  | {
      type: 'ADD_CARD_TO_PILE'
      cardId: string
      pileId: string
      categoryName?: string // Provided when pile becomes complete
    }
  | {
      type: 'SPLIT_PILE'
      pileId: string
    }
  | {
      type: 'RESET_GAME'
    }
  | {
      type: 'INCREMENT_MISTAKES'
    }
