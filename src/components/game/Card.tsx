'use client'

/**
 * Card Component
 *
 * Displays an individual card with its title.
 * Cards are styled based on their state (dragging, in pile, etc.)
 */

interface CardProps {
  id: string
  title: string
  isDragging?: boolean
  isInPile?: boolean
  pileColor?: string
}

/**
 * Generates a consistent color for a pile based on its index.
 * Uses Tailwind-safe color classes.
 */
function getPileColorClass(pileColor?: string): string {
  if (!pileColor) return 'bg-white border-gray-300'

  // Use a set of distinct colors for different piles
  const colors = [
    'bg-blue-50 border-blue-300',
    'bg-green-50 border-green-300',
    'bg-purple-50 border-purple-300',
    'bg-pink-50 border-pink-300',
    'bg-yellow-50 border-yellow-300',
    'bg-orange-50 border-orange-300',
    'bg-red-50 border-red-300',
    'bg-indigo-50 border-indigo-300',
    'bg-cyan-50 border-cyan-300',
    'bg-lime-50 border-lime-300',
  ]

  // Hash the pile color string to get consistent index
  let hash = 0
  for (let i = 0; i < pileColor.length; i++) {
    hash = pileColor.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length

  return colors[index]
}

export function Card({ id, title, isDragging = false, isInPile = false, pileColor }: CardProps) {
  const colorClass = isInPile ? getPileColorClass(pileColor) : 'bg-white border-gray-300'

  return (
    <div
      className={`
        relative p-3 rounded-lg border-2 shadow-sm
        ${colorClass}
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${!isDragging ? 'hover:shadow-md hover:scale-105' : ''}
        transition-all duration-150 cursor-move
        select-none
        flex items-center justify-center
        min-h-[60px]
      `}
      data-card-id={id}
    >
      <p className="text-sm font-medium text-gray-800 text-center break-words">{title}</p>
    </div>
  )
}
