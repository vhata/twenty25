/**
 * Game Utility Functions
 *
 * Core game logic functions for validation, scoring, and state queries.
 * These pure functions take state/data as input and return computed results.
 */

import type { Card, Category, GameState, Pile } from './types/game'

/**
 * Checks if a card can be added to a pile.
 * A card can only be added if it belongs to the same category as all other cards in the pile.
 *
 * @param card The card to add
 * @param pile The pile to add it to
 * @param allCards All cards in the game (needed to look up cards in pile)
 * @returns true if the card can be added, false otherwise
 */
export function canAddCardToPile(card: Card, pile: Pile, allCards: Card[]): boolean {
  // If pile is empty, any card can be added (shouldn't happen, but handle it)
  if (pile.cardIds.length === 0) {
    return true
  }

  // Get the category ID of the pile by checking the first card
  const pileCategoryId = getPileCategoryId(pile, allCards)

  // Card can be added only if its category matches the pile's category
  return card.categoryId === pileCategoryId
}

/**
 * Checks if a pile is complete (has all 45 cards from the same category).
 *
 * @param pile The pile to check
 * @returns true if the pile has exactly 45 cards, false otherwise
 */
export function isPileComplete(pile: Pile): boolean {
  return pile.cardIds.length === 45
}

/**
 * Gets the category ID of a pile by examining its cards.
 * All cards in a valid pile should have the same categoryId.
 *
 * @param pile The pile to check
 * @param allCards All cards in the game
 * @returns The categoryId, or null if pile is empty
 */
export function getPileCategoryId(pile: Pile, allCards: Card[]): string | null {
  if (pile.cardIds.length === 0) {
    return null
  }

  // Get the first card in the pile
  const firstCardId = pile.cardIds[0]
  const firstCard = allCards.find((c) => c.id === firstCardId)

  return firstCard ? firstCard.categoryId : null
}

/**
 * Looks up a category name by its ID.
 *
 * @param categoryId The category ID to look up
 * @param categories All categories in the game
 * @returns The category name, or null if not found
 */
export function getCategoryName(categoryId: string, categories: Category[]): string | null {
  const category = categories.find((c) => c.id === categoryId)
  return category ? category.name : null
}

/**
 * Gets all cards that are not currently in any pile.
 *
 * @param state The current game state
 * @returns Array of ungrouped cards
 */
export function getUngroupedCards(state: GameState): Card[] {
  // Collect all card IDs that are in piles
  const cardIdsInPiles = new Set<string>()
  for (const pile of state.piles) {
    for (const cardId of pile.cardIds) {
      cardIdsInPiles.add(cardId)
    }
  }

  // Return cards that are not in any pile
  return state.cards.filter((card) => !cardIdsInPiles.has(card.id))
}

/**
 * Gets all cards that are in a specific pile.
 *
 * @param pileId The pile ID
 * @param state The current game state
 * @returns Array of cards in the pile, in order
 */
export function getPileCards(pileId: string, state: GameState): Card[] {
  const pile = state.piles.find((p) => p.id === pileId)
  if (!pile) {
    return []
  }

  // Map card IDs to card objects, preserving order
  return pile.cardIds
    .map((cardId) => state.cards.find((c) => c.id === cardId))
    .filter((card): card is Card => card !== undefined)
}

/**
 * Calculates the total number of correctly placed cards.
 * A card is correctly placed if it's in a pile with cards from the same category.
 *
 * @param state The current game state
 * @returns Number of correctly placed cards
 */
export function calculateCorrectCards(state: GameState): number {
  let correctCount = 0

  for (const pile of state.piles) {
    // All cards in a pile are correct (we only allow valid additions)
    correctCount += pile.cardIds.length
  }

  return correctCount
}

/**
 * Calculates the game completion percentage.
 *
 * @param state The current game state
 * @returns Percentage complete (0-100)
 */
export function calculateCompletionPercentage(state: GameState): number {
  const totalCards = state.cards.length
  if (totalCards === 0) return 0

  const completedCards = state.completedCount * 45 // Each completed pile has 45 cards
  return Math.round((completedCards / totalCards) * 100)
}

/**
 * Finds which pile (if any) contains a specific card.
 *
 * @param cardId The card ID to search for
 * @param state The current game state
 * @returns The pile containing the card, or null if not in any pile
 */
export function findPileContainingCard(cardId: string, state: GameState): Pile | null {
  return state.piles.find((pile) => pile.cardIds.includes(cardId)) || null
}
