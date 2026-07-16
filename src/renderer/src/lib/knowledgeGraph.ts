const stopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'for',
  'from',
  'i',
  'in',
  'is',
  'it',
  'my',
  'of',
  'on',
  'that',
  'the',
  'this',
  'to',
  'with'
])

export interface RelatedCandidate {
  id: string
  text: string
}

function terms(text: string) {
  return new Set(
    (text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
      .filter((term) => term.length > 1 && !stopWords.has(term))
  )
}

export function relatedness(left: string, right: string) {
  const leftTerms = terms(left)
  const rightTerms = terms(right)
  if (!leftTerms.size || !rightTerms.size) return 0

  let intersection = 0
  for (const term of leftTerms) {
    if (rightTerms.has(term)) intersection += 1
  }

  const union = new Set([...leftTerms, ...rightTerms]).size
  const phraseBonus = left.toLocaleLowerCase().includes(right.toLocaleLowerCase()) ||
    right.toLocaleLowerCase().includes(left.toLocaleLowerCase())
    ? 0.15
    : 0
  return intersection / union + phraseBonus
}

export function findMostRelatedNode(content: string, candidates: RelatedCandidate[]) {
  let bestId = 'user'
  let bestScore = 0

  for (const candidate of candidates) {
    const score = relatedness(content, candidate.text)
    if (score > bestScore) {
      bestScore = score
      bestId = candidate.id
    }
  }

  return { id: bestId, score: bestScore }
}
