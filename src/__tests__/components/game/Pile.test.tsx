/**
 * Tests for Pile component
 */

import { Pile } from '@/components/game/Pile'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Pile', () => {
  const mockCards = [
    { id: 'card-1', title: 'Card 1' },
    { id: 'card-2', title: 'Card 2' },
    { id: 'card-3', title: 'Card 3' },
  ]

  describe('incomplete pile', () => {
    it('should render pile with card count', () => {
      render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={3}
          isComplete={false}
          revealedCategoryName={null}
        />
      )

      // Check for the "/ 45 cards" text which implies the count is shown
      expect(screen.getByText(/\/ 45 cards/)).toBeInTheDocument()
      // Verify the pile header is shown
      expect(screen.getByText('Pile')).toBeInTheDocument()
    })

    it('should display all cards in pile', () => {
      render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={3}
          isComplete={false}
          revealedCategoryName={null}
        />
      )

      expect(screen.getByText('Card 1')).toBeInTheDocument()
      expect(screen.getByText('Card 2')).toBeInTheDocument()
      expect(screen.getByText('Card 3')).toBeInTheDocument()
    })

    it('should show "Pile" as header for incomplete pile', () => {
      render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={3}
          isComplete={false}
          revealedCategoryName={null}
        />
      )

      expect(screen.getByText('Pile')).toBeInTheDocument()
    })

    it('should apply gray background for incomplete pile', () => {
      const { container } = render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={3}
          isComplete={false}
          revealedCategoryName={null}
        />
      )

      const pileElement = container.querySelector('[data-pile-id="pile-1"]')
      expect(pileElement).toHaveClass('bg-gray-50')
      expect(pileElement).toHaveClass('border-gray-300')
    })
  })

  describe('complete pile', () => {
    it('should display revealed category name', () => {
      render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={45}
          isComplete={true}
          revealedCategoryName="Programming Languages"
        />
      )

      expect(screen.getByText('Programming Languages')).toBeInTheDocument()
      expect(screen.getByText('Complete!')).toBeInTheDocument()
    })

    it('should apply green background for complete pile', () => {
      const { container } = render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={45}
          isComplete={true}
          revealedCategoryName="Test Category"
        />
      )

      const pileElement = container.querySelector('[data-pile-id="pile-1"]')
      expect(pileElement).toHaveClass('bg-green-50')
      expect(pileElement).toHaveClass('border-green-500')
    })

    it('should show checkmark for complete pile', () => {
      render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={45}
          isComplete={true}
          revealedCategoryName="Test Category"
        />
      )

      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('should show lock icon for complete pile', () => {
      render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={45}
          isComplete={true}
          revealedCategoryName="Test Category"
        />
      )

      expect(screen.getByTitle('Pile is locked')).toBeInTheDocument()
    })

    it('should not show card count for complete pile', () => {
      render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={45}
          isComplete={true}
          revealedCategoryName="Test Category"
        />
      )

      expect(screen.queryByText(/\/ 45 cards/)).not.toBeInTheDocument()
    })
  })

  describe('drag over state', () => {
    it('should show drag over indicator when dragging over incomplete pile', () => {
      render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={3}
          isComplete={false}
          revealedCategoryName={null}
          isDraggingOver={true}
        />
      )

      expect(screen.getByText('Drop here to add card')).toBeInTheDocument()
    })

    it('should apply blue border when dragging over', () => {
      const { container } = render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={3}
          isComplete={false}
          revealedCategoryName={null}
          isDraggingOver={true}
        />
      )

      const pileElement = container.querySelector('[data-pile-id="pile-1"]')
      expect(pileElement).toHaveClass('border-blue-500')
      expect(pileElement).toHaveClass('bg-blue-50')
    })

    it('should not show drag indicator for complete pile', () => {
      render(
        <Pile
          id="pile-1"
          cards={mockCards}
          cardCount={45}
          isComplete={true}
          revealedCategoryName="Test Category"
          isDraggingOver={true}
        />
      )

      expect(screen.queryByText('Drop here to add card')).not.toBeInTheDocument()
    })
  })

  describe('empty pile', () => {
    it('should show empty state when no cards', () => {
      render(
        <Pile id="pile-1" cards={[]} cardCount={0} isComplete={false} revealedCategoryName={null} />
      )

      expect(screen.getByText('Pile is empty')).toBeInTheDocument()
    })

    it('should show 0 card count for empty pile', () => {
      render(
        <Pile id="pile-1" cards={[]} cardCount={0} isComplete={false} revealedCategoryName={null} />
      )

      expect(screen.getByText(/0/)).toBeInTheDocument()
      expect(screen.getByText(/\/ 45 cards/)).toBeInTheDocument()
    })
  })

  describe('data attributes', () => {
    it('should include pile ID as data attribute', () => {
      const { container } = render(
        <Pile
          id="test-pile-123"
          cards={mockCards}
          cardCount={3}
          isComplete={false}
          revealedCategoryName={null}
        />
      )

      const pileElement = container.querySelector('[data-pile-id="test-pile-123"]')
      expect(pileElement).toBeInTheDocument()
    })
  })

  describe('scrolling', () => {
    it('should allow scrolling when many cards are present', () => {
      const manyCards = Array.from({ length: 20 }, (_, i) => ({
        id: `card-${i}`,
        title: `Card ${i}`,
      }))

      const { container } = render(
        <Pile
          id="pile-1"
          cards={manyCards}
          cardCount={20}
          isComplete={false}
          revealedCategoryName={null}
        />
      )

      const scrollContainer = container.querySelector('.overflow-y-auto')
      expect(scrollContainer).toBeInTheDocument()
      expect(scrollContainer).toHaveClass('max-h-[400px]')
    })
  })
})
