/**
 * Tests for GameContext and reducer
 */

import { GameProvider, useGame } from '@/lib/context/GameContext'
import type { GameData } from '@/lib/types/game'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

// Test data
const testGameData: GameData = {
  categories: [
    { id: 'cat-1', name: 'Category 1' },
    { id: 'cat-2', name: 'Category 2' },
  ],
  cards: [
    { id: 'card-1', title: 'Card 1', categoryId: 'cat-1' },
    { id: 'card-2', title: 'Card 2', categoryId: 'cat-1' },
    { id: 'card-3', title: 'Card 3', categoryId: 'cat-1' },
    { id: 'card-4', title: 'Card 4', categoryId: 'cat-2' },
    { id: 'card-5', title: 'Card 5', categoryId: 'cat-2' },
  ],
}

function createWrapper(initialData: GameData) {
  return ({ children }: { children: ReactNode }) => (
    <GameProvider initialData={initialData}>{children}</GameProvider>
  )
}

describe('GameContext', () => {
  describe('initial state', () => {
    it('should initialize with empty piles and zero mistakes', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(testGameData),
      })

      expect(result.current.state.piles).toHaveLength(0)
      expect(result.current.state.mistakes).toBe(0)
      expect(result.current.state.completedCount).toBe(0)
      expect(result.current.state.cards).toHaveLength(5)
    })

    it('should provide categories from initial data', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(testGameData),
      })

      expect(result.current.categories).toHaveLength(2)
      expect(result.current.categories[0].name).toBe('Category 1')
    })
  })

  describe('tryCreatePile', () => {
    it('should create a pile with two cards from same category', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(testGameData),
      })

      act(() => {
        const success = result.current.tryCreatePile('card-1', 'card-2')
        expect(success).toBe(true)
      })

      expect(result.current.state.piles).toHaveLength(1)
      expect(result.current.state.piles[0].cardIds).toEqual(['card-1', 'card-2'])
      expect(result.current.state.mistakes).toBe(0)
    })

    it('should reject creating pile with cards from different categories', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(testGameData),
      })

      act(() => {
        const success = result.current.tryCreatePile('card-1', 'card-4')
        expect(success).toBe(false)
      })

      expect(result.current.state.piles).toHaveLength(0)
      expect(result.current.state.mistakes).toBe(1)
    })

    it('should handle invalid card IDs', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(testGameData),
      })

      act(() => {
        const success = result.current.tryCreatePile('invalid-1', 'invalid-2')
        expect(success).toBe(false)
      })

      expect(result.current.state.piles).toHaveLength(0)
      expect(result.current.state.mistakes).toBe(0) // No mistake increment for invalid IDs
    })
  })

  describe('tryAddCardToPile', () => {
    it('should add a card to pile with matching category', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(testGameData),
      })

      // First create a pile
      act(() => {
        result.current.tryCreatePile('card-1', 'card-2')
      })

      const pileId = result.current.state.piles[0].id

      // Then add a third card from same category
      act(() => {
        const success = result.current.tryAddCardToPile('card-3', pileId)
        expect(success).toBe(true)
      })

      expect(result.current.state.piles[0].cardIds).toHaveLength(3)
      expect(result.current.state.piles[0].cardIds).toContain('card-3')
      expect(result.current.state.mistakes).toBe(0)
    })

    it('should reject adding card from different category', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(testGameData),
      })

      // Create a pile with cat-1 cards
      act(() => {
        result.current.tryCreatePile('card-1', 'card-2')
      })

      const pileId = result.current.state.piles[0].id

      // Try to add a cat-2 card
      act(() => {
        const success = result.current.tryAddCardToPile('card-4', pileId)
        expect(success).toBe(false)
      })

      expect(result.current.state.piles[0].cardIds).toHaveLength(2)
      expect(result.current.state.mistakes).toBe(1)
    })

    it('should not allow adding to completed pile', () => {
      // Create data with 45 cards in same category
      const largeData: GameData = {
        categories: [{ id: 'cat-1', name: 'Category 1' }],
        cards: Array.from({ length: 46 }, (_, i) => ({
          id: `card-${i}`,
          title: `Card ${i}`,
          categoryId: 'cat-1',
        })),
      }

      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(largeData),
      })

      // Create a pile and add cards to complete it
      act(() => {
        result.current.tryCreatePile('card-0', 'card-1')
      })

      const pileId = result.current.state.piles[0].id

      // Add 43 more cards to reach 45
      act(() => {
        for (let i = 2; i < 45; i++) {
          result.current.tryAddCardToPile(`card-${i}`, pileId)
        }
      })

      expect(result.current.state.piles[0].isComplete).toBe(true)
      expect(result.current.state.completedCount).toBe(1)

      // Try to add another card to completed pile
      act(() => {
        const success = result.current.tryAddCardToPile('card-45', pileId)
        expect(success).toBe(false)
      })

      expect(result.current.state.piles[0].cardIds).toHaveLength(45)
    })
  })

  describe('SPLIT_PILE', () => {
    it('should remove a pile and return cards to ungrouped', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(testGameData),
      })

      // Create a pile
      act(() => {
        result.current.tryCreatePile('card-1', 'card-2')
      })

      expect(result.current.state.piles).toHaveLength(1)
      const pileId = result.current.state.piles[0].id

      // Split the pile
      act(() => {
        result.current.dispatch({ type: 'SPLIT_PILE', pileId })
      })

      expect(result.current.state.piles).toHaveLength(0)
    })

    it('should decrement completed count when splitting complete pile', () => {
      // Create data with 45 cards
      const largeData: GameData = {
        categories: [{ id: 'cat-1', name: 'Category 1' }],
        cards: Array.from({ length: 45 }, (_, i) => ({
          id: `card-${i}`,
          title: `Card ${i}`,
          categoryId: 'cat-1',
        })),
      }

      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(largeData),
      })

      // Create and complete a pile
      act(() => {
        result.current.tryCreatePile('card-0', 'card-1')
      })

      const pileId = result.current.state.piles[0].id

      act(() => {
        for (let i = 2; i < 45; i++) {
          result.current.tryAddCardToPile(`card-${i}`, pileId)
        }
      })

      expect(result.current.state.completedCount).toBe(1)

      // Split the pile
      act(() => {
        result.current.dispatch({ type: 'SPLIT_PILE', pileId })
      })

      expect(result.current.state.completedCount).toBe(0)
    })
  })

  describe('RESET_GAME', () => {
    it('should reset game state but keep cards', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: createWrapper(testGameData),
      })

      // Make some moves
      act(() => {
        result.current.tryCreatePile('card-1', 'card-2')
        result.current.tryCreatePile('card-1', 'card-4') // This fails and increments mistakes
      })

      expect(result.current.state.piles).toHaveLength(1)
      expect(result.current.state.mistakes).toBe(1)

      // Reset
      act(() => {
        result.current.dispatch({ type: 'RESET_GAME' })
      })

      expect(result.current.state.piles).toHaveLength(0)
      expect(result.current.state.mistakes).toBe(0)
      expect(result.current.state.completedCount).toBe(0)
      expect(result.current.state.cards).toHaveLength(5) // Cards preserved
    })
  })

  describe('useGame hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useGame())
      }).toThrow('useGame must be used within a GameProvider')
    })
  })
})
