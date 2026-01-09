/**
 * Generate game data from Wikipedia categories
 *
 * Uses Wikipedia API to find categories with approximately 45 articles
 * and generates game-data.yaml with real Wikipedia content.
 *
 * Wikipedia API: https://en.wikipedia.org/w/api.php
 */

const fs = require('node:fs')
const path = require('node:path')

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
const TARGET_ARTICLES_PER_CATEGORY = 45
const TARGET_CATEGORIES = 45

// Wikipedia requires a User-Agent header
const USER_AGENT = 'Twenty25Game/1.0 (Educational card game; contact via GitHub)'

/**
 * Fetch category members from Wikipedia
 * @param {string} categoryName - Category name without "Category:" prefix
 * @returns {Promise<string[]>} - Array of article titles
 */
async function getCategoryMembers(categoryName) {
  const url = new URL(WIKIPEDIA_API)
  url.searchParams.set('action', 'query')
  url.searchParams.set('list', 'categorymembers')
  url.searchParams.set('cmtitle', `Category:${categoryName}`)
  url.searchParams.set('cmlimit', '500')
  url.searchParams.set('cmtype', 'page') // Only pages, not subcategories
  url.searchParams.set('format', 'json')

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
    },
  })

  if (!response.ok) {
    console.error(`API error: ${response.status} ${response.statusText}`)
    return []
  }

  const data = await response.json()

  if (!data.query?.categorymembers) {
    return []
  }

  return data.query.categorymembers.map((member) => member.title)
}

/**
 * Get a list of all categories from a parent category
 * @param {string} parentCategory - Parent category name
 * @returns {Promise<string[]>} - Array of category names
 */
async function getSubcategories(parentCategory) {
  const url = new URL(WIKIPEDIA_API)
  url.searchParams.set('action', 'query')
  url.searchParams.set('list', 'categorymembers')
  url.searchParams.set('cmtitle', `Category:${parentCategory}`)
  url.searchParams.set('cmlimit', '500')
  url.searchParams.set('cmtype', 'subcat') // Only subcategories
  url.searchParams.set('format', 'json')

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
    },
  })

  if (!response.ok) {
    console.error(`API error: ${response.status} ${response.statusText}`)
    return []
  }

  const data = await response.json()

  if (!data.query?.categorymembers) {
    return []
  }

  return data.query.categorymembers.map((member) => member.title.replace('Category:', ''))
}

/**
 * Find categories with approximately the target number of articles
 * @param {string[]} categories - List of category names to check
 * @returns {Promise<Array<{name: string, articles: string[], count: number}>>}
 */
async function findCategoriesWithTargetSize(categories) {
  const results = []

  for (const category of categories) {
    console.log(`Checking category: ${category}`)
    const articles = await getCategoryMembers(category)
    const count = articles.length

    console.log(`  → ${count} articles`)

    // Look for categories with 40-50 articles (some flexibility)
    if (count >= 40 && count <= 60) {
      results.push({
        name: category,
        articles: articles.slice(0, TARGET_ARTICLES_PER_CATEGORY), // Take first 45
        count,
      })

      console.log(`  ✓ Added (${count} articles)`)

      if (results.length >= TARGET_CATEGORIES) {
        break
      }
    }

    // Small delay to be nice to Wikipedia's servers
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}

/**
 * Generate YAML content from categories
 */
function generateYAML(categories) {
  const yamlContent = `categories:\n${categories
    .map((cat, catIndex) => {
      const cardsYaml = cat.articles
        .map(
          (article, articleIndex) =>
            `      - id: card-${catIndex + 1}-${articleIndex + 1}\n        title: "${article.replace(/"/g, '\\"')}"`
        )
        .join('\n')
      return `  - id: category-${catIndex + 1}\n    name: "${cat.name.replace(/"/g, '\\"')}"\n    cards:\n${cardsYaml}`
    })
    .join('\n')}\n`

  return yamlContent
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Searching for Wikipedia categories...\n')

  // Start with some broad parent categories that likely have many subcategories
  const parentCategories = [
    'Arts',
    'Sports',
    'Science',
    'History',
    'Geography',
    'Technology',
    'Culture',
    'Music',
    'Literature',
    'Film',
  ]

  const allSubcategories = []

  // Collect subcategories from all parent categories
  for (const parent of parentCategories) {
    console.log(`\nFetching subcategories from: ${parent}`)
    const subcats = await getSubcategories(parent)
    console.log(`  → Found ${subcats.length} subcategories`)
    allSubcategories.push(...subcats)

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log(`\n📊 Total subcategories to check: ${allSubcategories.length}\n`)

  // Find categories with the right size
  const selectedCategories = await findCategoriesWithTargetSize(allSubcategories)

  console.log(`\n✅ Found ${selectedCategories.length} suitable categories\n`)

  if (selectedCategories.length < TARGET_CATEGORIES) {
    console.warn(
      `⚠️  Warning: Only found ${selectedCategories.length} categories (target: ${TARGET_CATEGORIES})`
    )
  }

  // Generate YAML
  const yamlContent = generateYAML(selectedCategories)
  const outputPath = path.join(__dirname, '../src/data/game-data.yaml')
  fs.writeFileSync(outputPath, yamlContent, 'utf8')

  console.log(`\n✓ Generated ${selectedCategories.length} categories`)
  console.log(
    `✓ Total cards: ${selectedCategories.reduce((sum, cat) => sum + cat.articles.length, 0)}`
  )
  console.log(`✓ Saved to: ${outputPath}\n`)

  // Print sample categories
  console.log('📋 Sample categories:')
  selectedCategories.slice(0, 5).forEach((cat) => {
    console.log(`  • ${cat.name} (${cat.count} articles)`)
  })
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
