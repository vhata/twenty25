import Counter from '@/components/Counter'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center">Welcome to twenty25</h1>
        <p className="text-center text-gray-600">
          Built with Next.js 15, TypeScript, and Tailwind CSS
        </p>
        <div className="flex justify-center">
          <Counter />
        </div>
      </div>
    </main>
  )
}
