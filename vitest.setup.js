import { beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Make sure we have a window object for tests
global.window = global.window || {};

beforeEach(() => {
  // Setup global CONFIG object
  global.CONFIG = {
    storyPath: '/stories/test-story.md',
    storyFolder: '/stories/',
    colors: ['green', 'yellow', 'red', 'blue']
  }
})

afterEach(() => {
  if (cleanup) cleanup()
  vi.restoreAllMocks()
})