import { describe, expect, it } from 'vitest'
import { findMostRelatedNode, relatedness } from './knowledgeGraph'

describe('knowledge graph relationships', () => {
  it('scores shared meaningful terms above unrelated text', () => {
    expect(relatedness('voice assistant project', 'improve the voice project')).toBeGreaterThan(
      relatedness('voice assistant project', 'buy groceries tomorrow')
    )
  })

  it('finds the most related existing node', () => {
    const result = findMostRelatedNode('Use Gemini for the voice assistant', [
      { id: 'finance', text: 'Portfolio risk research' },
      { id: 'era', text: 'Build the ERA voice assistant with Gemini' }
    ])
    expect(result.id).toBe('era')
    expect(result.score).toBeGreaterThan(0)
  })

  it('falls back to the user node when no relationship exists', () => {
    expect(findMostRelatedNode('completely unique thought', []).id).toBe('user')
  })
})
