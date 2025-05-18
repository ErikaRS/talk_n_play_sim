# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Running the Application

```bash
# Install http-server (if needed)
npm install -g http-server

# Start the web server in the public directory
cd public
http-server -c-1 --cors
```

### Running Tests

```bash
# Run all tests (both Mocha and Vitest)
npm test

# Run only Mocha tests
npm run test:mocha

# Run only Vitest tests
npm run test:vitest

# Run a specific Mocha test file
npx mocha tests/parser.test.js

# Run a specific Vitest test file
npx vitest run tests-vite/parser.test.js

# Run Vitest in watch mode
npm run test:watch
```

> Note: The project has two complete test suites:
> 1. Mocha/Chai tests (in the `tests/` directory) using CommonJS format
> 2. Vitest tests (in the `tests-vite/` directory) using ES modules
>
> Both test the same functionality but provide different examples of testing approaches.

## Architecture

### Overview

This project is a web-based simulator for the Sesame Street Talk 'n Play interaction model, implementing a branching story experience where users can select different character paths that diverge and converge throughout a narrative. The application follows a modular design with clear separation of concerns:

1. **Parser Module (`parser.js`)**: 
   - Responsible for parsing story data from markdown format
   - Defines core data models: `Story` and `Page` classes
   - Converts markdown to HTML with special handling for color-specific content

2. **Renderer Module (`renderer.js`)**: 
   - Handles the presentation of story content in the DOM
   - Manages visual updates including page content, navigation buttons, and color selection

3. **Application Controller (`app.js`)**: 
   - Orchestrates the interaction between data models and UI
   - Manages application state (current page, selected color, etc.)
   - Handles event listeners and user interactions

4. **Story Data Format**:
   - Stories are defined in markdown files with specific formatting conventions
   - Each page contains fixed text and color-specific content for different character paths
   - Images are associated with each page

### Core Interaction Model

The Talk 'n Play simulation follows this interaction pattern:

1. **Four Parallel Story Tracks**: Each track follows the same visual progression with different character focus
2. **Character-Based Track Selection**: Four colored buttons represent different characters (green, yellow, red, blue)
3. **Convergent Storytelling Structure**: Stories diverge at choice points then reconverge on the next page

### Data Flow

1. The application loads a story from a markdown file
2. The `MarkdownParser` class converts the markdown into a structured `Story` object
3. The `StoryApp` class manages navigation and color selection
4. The `StoryRenderer` class renders the appropriate content based on the current page and color selection

## Testing Framework

The project has two testing setups:

1. **Mocha/Chai (Legacy)**: Located in `/tests`, using CommonJS modules
2. **Vitest (New)**: Located in `/tests-vite`, using ES modules

Both test suites cover the same core functionality but use different syntax patterns. The test suites focus on:

1. **Parser Tests**: Validate the markdown parser and story/page model functionality
2. **Renderer Tests**: Ensure UI components are correctly rendered based on story content
3. **App Tests**: Test the integration between components and user interaction flows

Both test frameworks can be run using the single `npm test` command, which will execute both test suites sequentially.