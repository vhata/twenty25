import Counter from '@/components/Counter'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Counter', () => {
  it('renders initial count of 0', () => {
    render(<Counter />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('increments count when increment button is clicked', () => {
    render(<Counter />)
    const incrementButton = screen.getByText('Increment')

    fireEvent.click(incrementButton)
    expect(screen.getByText('1')).toBeInTheDocument()

    fireEvent.click(incrementButton)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('decrements count when decrement button is clicked', () => {
    render(<Counter />)
    const decrementButton = screen.getByText('Decrement')

    fireEvent.click(decrementButton)
    expect(screen.getByText('-1')).toBeInTheDocument()
  })

  it('resets count to 0 when reset button is clicked', () => {
    render(<Counter />)
    const incrementButton = screen.getByText('Increment')
    const resetButton = screen.getByText('Reset')

    fireEvent.click(incrementButton)
    fireEvent.click(incrementButton)
    expect(screen.getByText('2')).toBeInTheDocument()

    fireEvent.click(resetButton)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
