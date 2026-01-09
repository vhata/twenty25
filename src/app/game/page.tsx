import { GameBoard } from '@/components/game/GameBoard'
import { GameControls } from '@/components/game/GameControls'
import { GameStats } from '@/components/game/GameStats'
import { GameProvider } from '@/lib/context/GameContext'
import { loadGameData } from '@/lib/game-data-loader'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Card Categorization Game - Twenty25',
  description:
    'Group 2025 cards into 45 categories in this discovery puzzle game. Drag cards to create piles and discover hidden categories!',
}

/**
 * Game Page
 *
 * Main game route that loads card data and provides the full game experience.
 * This is a Server Component that loads game data on the server, then passes it
 * to the client-side GameProvider for state management.
 */
export default function GamePage() {
  // Load game data on the server (YAML parsing, validation, shuffling)
  // Using skipStrictValidation for development with partial data
  const gameData = loadGameData(true)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Card Categorization Game</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Group all {gameData.cards.length} cards into {gameData.categories.length} categories.
            Discover which cards belong together through trial and error!
          </p>
        </header>

        <GameProvider initialData={gameData}>
          <GameControls />
          <GameStats />
          <GameBoard />
        </GameProvider>
      </div>
    </main>
  )
}
