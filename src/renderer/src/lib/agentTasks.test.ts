import { describe, expect, it } from 'vitest'
import {
  containsSensitiveTaskContext,
  createAgentMission,
  dependenciesSatisfied,
  priorityWeight
} from './agentTasks'

describe('multi-agent task runtime', () => {
  it('creates a dependency-aware four-task mission', () => {
    const { mission, tasks } = createAgentMission('Build a secure reminder service')
    expect(tasks).toHaveLength(4)
    expect(mission.taskIds).toEqual(tasks.map((task) => task.id))
    expect(tasks.filter((task) => task.dependencies.length === 0)).toHaveLength(2)
    expect(tasks.at(-1)?.agent).toBe('knowledge')
  })

  it('only releases dependent work after prerequisites complete', () => {
    const { tasks } = createAgentMission('Test objective')
    const planning = tasks.find((task) => task.agent === 'planning')!
    expect(dependenciesSatisfied(planning, tasks)).toBe(false)
    const completed = tasks.map((task) => planning.dependencies.includes(task.id)
      ? { ...task, status: 'completed' as const }
      : task)
    expect(dependenciesSatisfied(planning, completed)).toBe(true)
  })

  it('sorts high priority ahead of normal and low', () => {
    expect(priorityWeight('high')).toBeGreaterThan(priorityWeight('normal'))
    expect(priorityWeight('normal')).toBeGreaterThan(priorityWeight('low'))
  })

  it('detects sensitive task context before provider transmission', () => {
    expect(containsSensitiveTaskContext('api key: sk-secret-value')).toBe(true)
    expect(containsSensitiveTaskContext('summarize my public project plan')).toBe(false)
  })
})
