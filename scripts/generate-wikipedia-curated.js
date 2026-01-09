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
 * Check if a page is a meta-page (list, glossary, disambiguation, etc.)
 * Uses both title-based heuristics and Wikipedia metadata for reliability
 * @param {string} title - Page title to check
 * @returns {Promise<boolean>} - True if page should be excluded
 */
async function isMetaPage(title) {
  // First check: simple title-based heuristics for obvious cases
  // This acts as a fast backup when API checks fail
  const lowerTitle = title.toLowerCase()
  const metaTitlePatterns = [
    'list of ',
    'lists of ',
    'glossary of ',
    'index of ',
    'outline of ',
    'timeline of ',
  ]

  if (metaTitlePatterns.some((pattern) => lowerTitle.startsWith(pattern))) {
    return true
  }

  // Second check: Wikipedia metadata (more accurate but requires API call)
  const url = new URL(WIKIPEDIA_API)
  url.searchParams.set('action', 'query')
  url.searchParams.set('titles', title)
  url.searchParams.set('prop', 'categories|pageprops')
  url.searchParams.set('cllimit', '100') // Get up to 100 categories
  url.searchParams.set('format', 'json')

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      return false // If we can't check, include it
    }

    const data = await response.json()
    const pages = data.query?.pages
    if (!pages) return false

    const pageId = Object.keys(pages)[0]
    const page = pages[pageId]

    // Check page properties for disambiguation
    if (page.pageprops?.disambiguation !== undefined) {
      return true
    }

    // Check categories for meta-page indicators
    const categories = page.categories || []
    const metaCategoryPatterns = [
      'Wikipedia lists',
      'Lists of',
      'Wikipedia glossaries',
      'Glossaries of',
      'Wikipedia indexes',
      'Indexes of',
      'Wikipedia outlines',
      'Outlines of',
      'Timelines of',
      'Wikipedia timelines',
      'Set index articles',
      'Disambiguation pages',
    ]

    for (const cat of categories) {
      const catTitle = cat.title.replace('Category:', '')
      if (metaCategoryPatterns.some((pattern) => catTitle.includes(pattern))) {
        return true
      }
    }

    return false
  } catch (error) {
    // If API check fails, fall back to title-based check
    return false
  }
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

  const allTitles = data.query.categorymembers.map((member) => member.title)

  // Filter out meta-pages by checking each title
  const filteredTitles = []
  let metaPageCount = 0
  for (const title of allTitles) {
    const isMeta = await isMetaPage(title)
    if (!isMeta) {
      filteredTitles.push(title)
    } else {
      metaPageCount++
      console.log(`    Filtered meta-page: "${title}"`)
    }
    // Small delay to avoid rate limiting
    await sleep(100)
  }

  if (metaPageCount > 0) {
    console.log(`    Total meta-pages filtered: ${metaPageCount}`)
  }

  return filteredTitles
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

      // Check if we have enough unique articles
      if (uniqueArticles.length < TARGET_ARTICLES_PER_CATEGORY) {
        console.log(
          `  ⚠️  Only ${uniqueArticles.length} unique articles available (need ${TARGET_ARTICLES_PER_CATEGORY}), skipping`
        )
        failCount++
      } else {
        // Take exactly 45 unique articles
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

  if (results.length !== 45) {
    console.log(`\n⚠️  WARNING: Got ${results.length} categories but need exactly 45 for the game!`)
    console.log('Please update curated-categories.json with more suitable categories.')
    process.exit(1)
  }

  // Generate YAML
  const yamlContent = generateYAML(results)
  const outputPath = path.join(__dirname, '../src/data/game-data.yaml')
  fs.writeFileSync(outputPath, yamlContent, 'utf8')

  const totalCards = results.reduce((sum, cat) => sum + cat.articles.length, 0)

  console.log(`\n✓ Generated ${results.length} categories`)
  console.log(`✓ Total cards: ${totalCards}`)
  console.log(
    `✓ Expected: ${results.length * TARGET_ARTICLES_PER_CATEGORY} cards (45 categories × 45 cards)`
  )

  // Verify all categories have exactly 45 cards
  const invalidCategories = results.filter(
    (cat) => cat.articles.length !== TARGET_ARTICLES_PER_CATEGORY
  )
  if (invalidCategories.length > 0) {
    console.log('\n⚠️  ERROR: Some categories do not have exactly 45 cards:')
    for (const cat of invalidCategories) {
      console.log(`  • ${cat.name}: ${cat.articles.length} cards`)
    }
    process.exit(1)
  }

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
