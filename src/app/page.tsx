import Counter from '@/components/Counter'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center">Welcome to twenty25</h1>
        <p className="text-center text-gray-600">
          Built with Next.js 15, TypeScript, and Tailwind CSS
        </p>

        <div className="flex flex-col items-center gap-6">
          <Link
            href="/game"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Play Card Categorization Game
          </Link>

          <div className="text-center text-sm text-gray-500 max-w-md">
            Group 2025 cards into 45 categories. Discover hidden patterns through drag-and-drop
            gameplay!
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Counter />
        </div>
      </div>
    </main>
  )
}
