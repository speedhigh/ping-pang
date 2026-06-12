import { describe, expect, it } from 'vitest'
import { getCurrentServer } from './serveRotation'

describe('getCurrentServer', () => {
  const first = 'A' as const

  it('starts with first server at 0:0', () => {
    expect(getCurrentServer(0, 0, first)).toBe('A')
  })

  it('keeps first server for second point at 1:0', () => {
    expect(getCurrentServer(1, 0, first)).toBe('A')
  })

  it('switches after two points at 2:0', () => {
    expect(getCurrentServer(2, 0, first)).toBe('B')
  })

  it('alternates every two points before deuce', () => {
    expect(getCurrentServer(4, 0, first)).toBe('A')
    expect(getCurrentServer(5, 0, first)).toBe('A')
    expect(getCurrentServer(6, 0, first)).toBe('B')
  })

  it('handles 10:9 before deuce', () => {
    expect(getCurrentServer(10, 9, first)).toBe('B')
  })

  it('handles 10:10 deuce start', () => {
    expect(getCurrentServer(10, 10, first)).toBe('A')
  })

  it('alternates every point after 10:10', () => {
    expect(getCurrentServer(11, 10, first)).toBe('B')
    expect(getCurrentServer(10, 11, first)).toBe('B')
    expect(getCurrentServer(11, 11, first)).toBe('A')
  })

  it('works when B is first server', () => {
    expect(getCurrentServer(0, 0, 'B')).toBe('B')
    expect(getCurrentServer(1, 0, 'B')).toBe('B')
    expect(getCurrentServer(2, 0, 'B')).toBe('A')
  })
})
