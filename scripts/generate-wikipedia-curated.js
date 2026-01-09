/**
 * Generate game data from curated Wikipedia categories
 *
 * Uses a pre-selected list of interesting categories and fetches exactly
 * 45 articles from each to create the full 2025-card dataset.
 *
 * Wikipedia API: https://en.wikipedia.org/w/api.php
 */

const fs = require('node:fs')
const path = require('node:path')

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
const TARGET_ARTICLES_PER_CATEGORY = 45

// Wikipedia requires a User-Agent header
const USER_AGENT = 'Twenty25Game/1.0 (Educational card game; contact via GitHub)'

// Delay between requests to avoid rate limiting (in milliseconds)
const REQUEST_DELAY = 500

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch category members from Wikipedia
 * @param {string} categoryName - Category name without "Category:" prefix
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<string[]>} - Array of article titles
 */
async function getCategoryMembers(categoryName, limit = 50) {
  const url = new URL(WIKIPEDIA_API)
  url.searchParams.set('action', 'query')
  url.searchParams.set('list', 'categorymembers')
  url.searchParams.set('cmtitle', `Category:${categoryName}`)
  url.searchParams.set('cmlimit', String(limit))
  url.searchParams.set('cmtype', 'page') // Only pages, not subcategories
  url.searchParams.set('format', 'json')

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
    },
  })

  if (!response.ok) {
    console.error(`  ❌ API error: ${response.status} ${response.statusText}`)
    return []
  }

  const data = await response.json()

  if (!data.query?.categorymembers) {
    return []
  }

  return data.query.categorymembers.map((member) => member.title)
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
  console.log('🔍 Fetching Wikipedia data from curated categories...\n')

  // Load curated categories list
  const categoriesListPath = path.join(__dirname, 'curated-categories.json')
  const curatedCategories = JSON.parse(fs.readFileSync(categoriesListPath, 'utf8'))

  console.log(`📋 Processing ${curatedCategories.length} curated categories...\n`)

  const results = []
  let successCount = 0
  let failCount = 0
  const usedArticles = new Set() // Track used articles to prevent duplicates

  for (const [index, categoryName] of curatedCategories.entries()) {
    const progress = `[${index + 1}/${curatedCategories.length}]`
    console.log(`${progress} Fetching: ${categoryName}`)

    const articles = await getCategoryMembers(categoryName, 50)

    if (articles.length === 0) {
      console.log('  ⚠️  No articles found, skipping')
      failCount++
    } else {
      // Filter out articles that have already been used
      const uniqueArticles = articles.filter((article) => !usedArticles.has(article))

      // Take exactly 45 unique articles (or all available if less than 45)
      const selectedArticles = uniqueArticles.slice(0, TARGET_ARTICLES_PER_CATEGORY)

      // Add selected articles to the used set
      selectedArticles.forEach((article) => usedArticles.add(article))

      results.push({
        name: categoryName,
        articles: selectedArticles,
        count: articles.length,
      })

      const duplicatesSkipped = articles.length - uniqueArticles.length
      if (duplicatesSkipped > 0) {
        console.log(
          `  ✓ Got ${selectedArticles.length} articles (${articles.length} total, ${duplicatesSkipped} duplicates skipped)`
        )
      } else {
        console.log(
          `  ✓ Got ${selectedArticles.length} articles (${articles.length} total available)`
        )
      }
      successCount++
    }

    // Delay between requests to avoid rate limiting
    if (index < curatedCategories.length - 1) {
      await sleep(REQUEST_DELAY)
    }
  }

  console.log(`\n✅ Successfully fetched ${successCount} categories`)
  if (failCount > 0) {
    console.log(`⚠️  Failed to fetch ${failCount} categories`)
  }

  // Generate YAML
  const yamlContent = generateYAML(results)
  const outputPath = path.join(__dirname, '../src/data/game-data.yaml')
  fs.writeFileSync(outputPath, yamlContent, 'utf8')

  const totalCards = results.reduce((sum, cat) => sum + cat.articles.length, 0)

  console.log(`\n✓ Generated ${results.length} categories`)
  console.log(`✓ Total cards: ${totalCards}`)
  console.log(`✓ Saved to: ${outputPath}\n`)

  // Show some sample data
  console.log('📋 Sample data:')
  results.slice(0, 3).forEach((cat) => {
    console.log(`\n  ${cat.name}:`)
    console.log(`    • ${cat.articles.slice(0, 3).join(', ')}...`)
  })
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
