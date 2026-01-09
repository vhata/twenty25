/**
 * Tests for game utility functions
 */

import {
  calculateCompletionPercentage,
  calculateCorrectCards,
  canAddCardToPile,
  findPileContainingCard,
  getCategoryName,
  getPileCards,
  getPileCategoryId,
  getUngroupedCards,
  isPileComplete,
} from '@/lib/game-utils'
import type { Card, Category, GameState, Pile } from '@/lib/types/game'
import { describe, expect, it } from 'vitest'

// Test data
const testCards: Card[] = [
  { id: 'card-1', title: 'Card 1', categoryId: 'cat-1' },
  { id: 'card-2', title: 'Card 2', categoryId: 'cat-1' },
  { id: 'card-3', title: 'Card 3', categoryId: 'cat-2' },
  { id: 'card-4', title: 'Card 4', categoryId: 'cat-2' },
  { id: 'card-5', title: 'Card 5', categoryId: 'cat-1' },
]

const testCategories: Category[] = [
  { id: 'cat-1', name: 'Category 1' },
  { id: 'cat-2', name: 'Category 2' },
]

const testPile1: Pile = {
  id: 'pile-1',
  cardIds: ['card-1', 'card-2'],
  isComplete: false,
  revealedCategoryName: null,
}

const testPile2: Pile = {
  id: 'pile-2',
  cardIds: ['card-3'],
  isComplete: false,
  revealedCategoryName: null,
}

const testState: GameState = {
  cards: testCards,
  piles: [testPile1, testPile2],
  mistakes: 0,
  completedCount: 0,
}

describe('canAddCardToPile', () => {
  it('should allow adding a card with matching category', () => {
    const card = testCards[4] // card-5, cat-1
    const pile = testPile1 // contains card-1, card-2 (both cat-1)

    expect(canAddCardToPile(card, pile, testCards)).toBe(true)
  })

  it('should reject adding a card with different category', () => {
    const card = testCards[2] // card-3, cat-2
    const pile = testPile1 // contains card-1, card-2 (both cat-1)

    expect(canAddCardToPile(card, pile, testCards)).toBe(false)
  })

  it('should allow adding to empty pile', () => {
    const card = testCards[0]
    const emptyPile: Pile = {
      id: 'empty',
      cardIds: [],
      isComplete: false,
      revealedCategoryName: null,
    }

    expect(canAddCardToPile(card, emptyPile, testCards)).toBe(true)
  })
})

describe('isPileComplete', () => {
  it('should return false for pile with less than 45 cards', () => {
    expect(isPileComplete(testPile1)).toBe(false)
  })

  it('should return true for pile with exactly 45 cards', () => {
    const completePile: Pile = {
      id: 'complete',
      cardIds: Array.from({ length: 45 }, (_, i) => `card-${i}`),
      isComplete: true,
      revealedCategoryName: 'Complete Category',
    }

    expect(isPileComplete(completePile)).toBe(true)
  })

  it('should return false for empty pile', () => {
    const emptyPile: Pile = {
      id: 'empty',
      cardIds: [],
      isComplete: false,
      revealedCategoryName: null,
    }

    expect(isPileComplete(emptyPile)).toBe(false)
  })
})

describe('getPileCategoryId', () => {
  it('should return the category ID of the pile', () => {
    expect(getPileCategoryId(testPile1, testCards)).toBe('cat-1')
    expect(getPileCategoryId(testPile2, testCards)).toBe('cat-2')
  })

  it('should return null for empty pile', () => {
    const emptyPile: Pile = {
      id: 'empty',
      cardIds: [],
      isComplete: false,
      revealedCategoryName: null,
    }

    expect(getPileCategoryId(emptyPile, testCards)).toBe(null)
  })

  it('should return null if card not found', () => {
    const invalidPile: Pile = {
      id: 'invalid',
      cardIds: ['nonexistent-card'],
      isComplete: false,
      revealedCategoryName: null,
    }

    expect(getPileCategoryId(invalidPile, testCards)).toBe(null)
  })
})

describe('getCategoryName', () => {
  it('should return the category name for valid ID', () => {
    expect(getCategoryName('cat-1', testCategories)).toBe('Category 1')
    expect(getCategoryName('cat-2', testCategories)).toBe('Category 2')
  })

  it('should return null for invalid ID', () => {
    expect(getCategoryName('nonexistent', testCategories)).toBe(null)
  })
})

describe('getUngroupedCards', () => {
  it('should return cards not in any pile', () => {
    const ungrouped = getUngroupedCards(testState)

    expect(ungrouped).toHaveLength(2)
    expect(ungrouped.map((c) => c.id)).toEqual(['card-4', 'card-5'])
  })

  it('should return all cards when no piles exist', () => {
    const stateWithNoPiles: GameState = {
      ...testState,
      piles: [],
    }

    const ungrouped = getUngroupedCards(stateWithNoPiles)
    expect(ungrouped).toHaveLength(5)
  })

  it('should return empty array when all cards are in piles', () => {
    const stateWithAllPiled: GameState = {
      cards: testCards,
      piles: [
        {
          id: 'pile-all',
          cardIds: testCards.map((c) => c.id),
          isComplete: false,
          revealedCategoryName: null,
        },
      ],
      mistakes: 0,
      completedCount: 0,
    }

    const ungrouped = getUngroupedCards(stateWithAllPiled)
    expect(ungrouped).toHaveLength(0)
  })
})

describe('getPileCards', () => {
  it('should return cards in the pile in order', () => {
    const cards = getPileCards('pile-1', testState)

    expect(cards).toHaveLength(2)
    expect(cards[0].id).toBe('card-1')
    expect(cards[1].id).toBe('card-2')
  })

  it('should return empty array for nonexistent pile', () => {
    const cards = getPileCards('nonexistent', testState)
    expect(cards).toHaveLength(0)
  })

  it('should handle pile with invalid card IDs', () => {
    const stateWithInvalidPile: GameState = {
      ...testState,
      piles: [
        {
          id: 'pile-invalid',
          cardIds: ['card-1', 'nonexistent-card', 'card-2'],
          isComplete: false,
          revealedCategoryName: null,
        },
      ],
    }

    const cards = getPileCards('pile-invalid', stateWithInvalidPile)
    expect(cards).toHaveLength(2) // Should skip nonexistent card
  })
})

describe('calculateCorrectCards', () => {
  it('should count all cards in all piles', () => {
    expect(calculateCorrectCards(testState)).toBe(3) // pile-1 has 2, pile-2 has 1
  })

  it('should return 0 when no piles exist', () => {
    const stateWithNoPiles: GameState = {
      ...testState,
      piles: [],
    }

    expect(calculateCorrectCards(stateWithNoPiles)).toBe(0)
  })
})

describe('calculateCompletionPercentage', () => {
  it('should calculate completion percentage based on completed piles', () => {
    const stateWithCompletion: GameState = {
      cards: Array.from({ length: 135 }, (_, i) => ({
        id: `card-${i}`,
        title: `Card ${i}`,
        categoryId: `cat-${Math.floor(i / 45)}`,
      })),
      piles: [],
      mistakes: 0,
      completedCount: 1, // 1 complete pile = 45 cards
    }

    // 45 / 135 = 33.33% = 33% rounded
    expect(calculateCompletionPercentage(stateWithCompletion)).toBe(33)
  })

  it('should return 0 for no completed piles', () => {
    expect(calculateCompletionPercentage(testState)).toBe(0)
  })

  it('should return 0 for empty game', () => {
    const emptyState: GameState = {
      cards: [],
      piles: [],
      mistakes: 0,
      completedCount: 0,
    }

    expect(calculateCompletionPercentage(emptyState)).toBe(0)
  })

  it('should return 100 for fully completed game', () => {
    const completeState: GameState = {
      cards: Array.from({ length: 135 }, (_, i) => ({
        id: `card-${i}`,
        title: `Card ${i}`,
        categoryId: `cat-${Math.floor(i / 45)}`,
      })),
      piles: [],
      mistakes: 0,
      completedCount: 3, // 3 complete piles = 135 cards
    }

    expect(calculateCompletionPercentage(completeState)).toBe(100)
  })
})

describe('findPileContainingCard', () => {
  it('should find the pile containing the card', () => {
    const pile = findPileContainingCard('card-1', testState)

    expect(pile).not.toBeNull()
    expect(pile?.id).toBe('pile-1')
  })

  it('should return null if card is not in any pile', () => {
    const pile = findPileContainingCard('card-5', testState)

    expect(pile).toBeNull()
  })

  it('should return null for nonexistent card', () => {
    const pile = findPileContainingCard('nonexistent', testState)

    expect(pile).toBeNull()
  })
})
