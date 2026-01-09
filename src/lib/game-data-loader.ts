/**
 * Game Data Loader
 *
 * Loads card categorization game data from YAML file, validates it,
 * transforms it into the GameData structure, and shuffles cards for
 * random display order.
 */

import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import type { Card, Category, GameData } from './types/game'

/**
 * Structure of the raw YAML file before transformation.
 */
interface YAMLCategory {
  id: string
  name: string
  cards: Array<{
    id: string
    title: string
  }>
}

interface YAMLData {
  categories: YAMLCategory[]
}

/**
 * Fisher-Yates shuffle algorithm for randomizing array order.
 * Creates a new shuffled array without mutating the original.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Validates the loaded YAML data structure.
 * Throws an error if validation fails.
 *
 * @param data The raw YAML data to validate
 * @param skipStrictValidation If true, allows partial data for development/testing
 */
function validateGameData(data: YAMLData, skipStrictValidation = false): void {
  if (!data.categories || !Array.isArray(data.categories)) {
    throw new Error('YAML data must have a "categories" array')
  }

  const { categories } = data

  // Check total number of categories (skip in development mode)
  if (!skipStrictValidation && categories.length !== 45) {
    throw new Error(
      `Expected 45 categories, but found ${categories.length}. Game requires exactly 45 categories with 45 cards each (2025 total).`
    )
  }

  // Validate each category
  for (const [index, category] of categories.entries()) {
    if (!category.id || typeof category.id !== 'string') {
      throw new Error(`Category at index ${index} missing valid "id" field`)
    }

    if (!category.name || typeof category.name !== 'string') {
      throw new Error(`Category "${category.id}" missing valid "name" field`)
    }

    if (!category.cards || !Array.isArray(category.cards)) {
      throw new Error(`Category "${category.id}" missing "cards" array`)
    }

    // Check card count per category (skip in development mode)
    if (!skipStrictValidation && category.cards.length !== 45) {
      throw new Error(
        `Category "${category.id}" has ${category.cards.length} cards, but requires exactly 45`
      )
    }

    // Validate each card in the category
    for (const [cardIndex, card] of category.cards.entries()) {
      if (!card.id || typeof card.id !== 'string') {
        throw new Error(
          `Card at index ${cardIndex} in category "${category.id}" missing valid "id" field`
        )
      }

      if (!card.title || typeof card.title !== 'string') {
        throw new Error(
          `Card "${card.id}" in category "${category.id}" missing valid "title" field`
        )
      }
    }
  }

  // Validate unique card IDs across all categories
  const allCardIds = new Set<string>()
  for (const category of categories) {
    for (const card of category.cards) {
      if (allCardIds.has(card.id)) {
        throw new Error(`Duplicate card ID found: "${card.id}"`)
      }
      allCardIds.add(card.id)
    }
  }

  // Validate unique category IDs
  const categoryIds = new Set(categories.map((c) => c.id))
  if (categoryIds.size !== categories.length) {
    throw new Error('Duplicate category IDs found')
  }
}

/**
 * Loads game data from YAML file, validates it, transforms it into
 * GameData structure, and shuffles cards for random display.
 *
 * @param skipStrictValidation If true, allows partial data for development/testing (default: false)
 * @returns GameData with categories and shuffled flat list of cards
 * @throws Error if YAML file is missing, invalid, or fails validation
 */
export function loadGameData(skipStrictValidation = false): GameData {
  // Load YAML file
  const yamlPath = path.join(process.cwd(), 'src', 'data', 'game-data.yaml')

  if (!fs.existsSync(yamlPath)) {
    throw new Error(
      `Game data file not found at ${yamlPath}. Please ensure src/data/game-data.yaml exists.`
    )
  }

  const fileContents = fs.readFileSync(yamlPath, 'utf8')

  // Parse YAML
  let rawData: YAMLData
  try {
    rawData = yaml.load(fileContents) as YAMLData
  } catch (error) {
    throw new Error(
      `Failed to parse YAML file: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  // Validate data structure
  validateGameData(rawData, skipStrictValidation)

  // Transform into GameData structure
  const categories: Category[] = rawData.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }))

  // Flatten cards from all categories and assign categoryId to each
  const cards: Card[] = rawData.categories.flatMap((category) =>
    category.cards.map((card) => ({
      id: card.id,
      title: card.title,
      categoryId: category.id,
    }))
  )

  // Shuffle cards for random display order
  const shuffledCards = shuffleArray(cards)

  return {
    categories,
    cards: shuffledCards,
  }
}
