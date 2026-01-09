/**
 * Tests for Card component
 */

import { Card } from '@/components/game/Card'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Card', () => {
  it('should render card with title', () => {
    render(<Card id="card-1" title="Test Card" />)

    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('should apply dragging styles when isDragging is true', () => {
    const { container } = render(<Card id="card-1" title="Test Card" isDragging={true} />)

    const cardElement = container.querySelector('[data-card-id="card-1"]')
    expect(cardElement).toHaveClass('opacity-50')
    expect(cardElement).toHaveClass('scale-95')
  })

  it('should apply default styles when not dragging', () => {
    const { container } = render(<Card id="card-1" title="Test Card" isDragging={false} />)

    const cardElement = container.querySelector('[data-card-id="card-1"]')
    expect(cardElement).toHaveClass('opacity-100')
    expect(cardElement).not.toHaveClass('scale-95')
  })

  it('should apply pile colors when isInPile is true', () => {
    const { container } = render(
      <Card id="card-1" title="Test Card" isInPile={true} pileColor="pile-1" />
    )

    const cardElement = container.querySelector('[data-card-id="card-1"]')
    // Should have a colored background (not white)
    expect(cardElement?.className).toMatch(
      /bg-(blue|green|purple|pink|yellow|orange|red|indigo|cyan|lime)-50/
    )
  })

  it('should use white background when not in pile', () => {
    const { container } = render(<Card id="card-1" title="Test Card" isInPile={false} />)

    const cardElement = container.querySelector('[data-card-id="card-1"]')
    expect(cardElement).toHaveClass('bg-white')
    expect(cardElement).toHaveClass('border-gray-300')
  })

  it('should include card ID as data attribute', () => {
    const { container } = render(<Card id="test-card-123" title="Test Card" />)

    const cardElement = container.querySelector('[data-card-id="test-card-123"]')
    expect(cardElement).toBeInTheDocument()
  })

  it('should have cursor-move class', () => {
    const { container } = render(<Card id="card-1" title="Test Card" />)

    const cardElement = container.querySelector('[data-card-id="card-1"]')
    expect(cardElement).toHaveClass('cursor-move')
  })

  it('should render long titles with word breaking', () => {
    const longTitle = 'This is a very long card title that should break across lines'
    render(<Card id="card-1" title={longTitle} />)

    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('should use consistent colors for same pile ID', () => {
    const { container: container1 } = render(
      <Card id="card-1" title="Card 1" isInPile={true} pileColor="pile-abc" />
    )
    const { container: container2 } = render(
      <Card id="card-2" title="Card 2" isInPile={true} pileColor="pile-abc" />
    )

    const card1 = container1.querySelector('[data-card-id="card-1"]')
    const card2 = container2.querySelector('[data-card-id="card-2"]')

    // Both cards should have same background color class
    const bgColorClass1 = card1?.className.match(/bg-\w+-50/)
    const bgColorClass2 = card2?.className.match(/bg-\w+-50/)

    expect(bgColorClass1).toEqual(bgColorClass2)
  })
})
