/**
 * Tests for CardGrid component
 */

import { CardGrid } from '@/components/game/CardGrid'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('CardGrid', () => {
  const mockCards = [
    { id: 'card-1', title: 'Card 1' },
    { id: 'card-2', title: 'Card 2' },
    { id: 'card-3', title: 'Card 3' },
  ]

  it('should render header with title', () => {
    render(<CardGrid cards={mockCards} totalCards={10} />)

    expect(screen.getByText('Ungrouped Cards')).toBeInTheDocument()
  })

  it('should display ungrouped card count', () => {
    render(<CardGrid cards={mockCards} totalCards={10} />)

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('cards remaining', { exact: false })).toBeInTheDocument()
  })

  it('should display grouped card count', () => {
    render(<CardGrid cards={mockCards} totalCards={10} />)

    expect(screen.getByText('(7 grouped)')).toBeInTheDocument()
  })

  it('should render all cards in grid', () => {
    render(<CardGrid cards={mockCards} totalCards={10} />)

    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
    expect(screen.getByText('Card 3')).toBeInTheDocument()
  })

  it('should show empty state when no cards', () => {
    render(<CardGrid cards={[]} totalCards={10} />)

    expect(screen.getByText('All cards have been grouped!')).toBeInTheDocument()
    expect(screen.getByText(/Continue working on your piles/)).toBeInTheDocument()
  })

  it('should show zero remaining when all grouped', () => {
    render(<CardGrid cards={[]} totalCards={10} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('cards remaining', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('(10 grouped)')).toBeInTheDocument()
  })

  it('should use responsive grid layout', () => {
    const { container } = render(<CardGrid cards={mockCards} totalCards={10} />)

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-2')
    expect(grid).toHaveClass('sm:grid-cols-3')
    expect(grid).toHaveClass('md:grid-cols-4')
    expect(grid).toHaveClass('lg:grid-cols-5')
    expect(grid).toHaveClass('xl:grid-cols-6')
  })

  it('should handle when all cards are ungrouped', () => {
    const allCards = Array.from({ length: 2025 }, (_, i) => ({
      id: `card-${i}`,
      title: `Card ${i}`,
    }))

    render(<CardGrid cards={allCards} totalCards={2025} />)

    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(screen.getByText('cards remaining', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('(0 grouped)')).toBeInTheDocument()
  })

  it('should have proper styling classes', () => {
    const { container } = render(<CardGrid cards={mockCards} totalCards={10} />)

    const wrapper = container.querySelector('.bg-white')
    expect(wrapper).toHaveClass('rounded-xl')
    expect(wrapper).toHaveClass('shadow-lg')
    expect(wrapper).toHaveClass('border-2')
  })
})
