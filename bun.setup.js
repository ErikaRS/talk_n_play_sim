import { beforeEach, afterEach } from 'bun:test';
import '@testing-library/jest-dom';

// Make sure we have a window object for tests
global.window = global.window || {};

beforeEach(() => {
  // Setup global CONFIG object
  global.CONFIG = {
    storyPath: '/stories/test-story.md',
    storyFolder: '/stories/',
    colors: ['green', 'yellow', 'red', 'blue']
  }
});

afterEach(() => {
  // Bun has no direct equivalent to vi.restoreAllMocks(), but we can handle mocks differently
});