/**
 * Generate test data: 45 categories × 45 cards = 2025 cards
 * Uses simple letter patterns: a, aa, aaa, b, bb, bbb, etc.
 */

const fs = require('node:fs')
const path = require('node:path')

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

// Generate 45 category letters (a-z, then aa-ss for the remaining 19)
const categoryLetters = []
for (let i = 0; i < 26; i++) {
  categoryLetters.push(letters[i])
}
for (let i = 0; i < 19; i++) {
  categoryLetters.push(letters[i] + letters[i])
}

const categories = categoryLetters.map((letter, catIndex) => {
  const cards = []
  for (let cardIndex = 1; cardIndex <= 45; cardIndex++) {
    cards.push({
      id: `card-${catIndex + 1}-${cardIndex}`,
      title: letter.repeat(cardIndex), // a, aa, aaa, aaaa, etc.
    })
  }

  return {
    id: `category-${catIndex + 1}`,
    name: `Category ${letter.toUpperCase()}`,
    cards,
  }
})

const yamlContent = `categories:\n${categories
  .map((cat) => {
    const cardsYaml = cat.cards
      .map((card) => `      - id: ${card.id}\n        title: "${card.title}"`)
      .join('\n')
    return `  - id: ${cat.id}\n    name: "${cat.name}"\n    cards:\n${cardsYaml}`
  })
  .join('\n')}\n`

const outputPath = path.join(__dirname, '../src/data/game-data.yaml')
fs.writeFileSync(outputPath, yamlContent, 'utf8')

console.log(
  `✓ Generated ${categories.length} categories with ${categories[0].cards.length} cards each`
)
console.log(`✓ Total cards: ${categories.length * categories[0].cards.length}`)
console.log(`✓ Saved to: ${outputPath}`)
