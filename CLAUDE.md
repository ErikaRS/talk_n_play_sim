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
# Run all tests
npm test

# Run tests
npm run test:vitest

# Run a specific test file
npx vitest run tests-vite/parser.test.js

# Run Vitest in watch mode
npm run test:watch
```

> Note: The project uses Vitest as its testing framework.
> Tests are located in the `tests-vite/` directory using ES modules format.

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

The project uses Vitest as its testing framework:

- **Vitest**: Located in `/tests-vite`, using ES modules

The test suite focuses on:

1. **Parser Tests**: Validate the markdown parser and story/page model functionality
2. **Renderer Tests**: Ensure UI components are correctly rendered based on story content
3. **App Tests**: Test the integration between components and user interaction flows

Tests can be run using the `npm test` command or `npm run test:watch` for interactive development.

## Code Style Guide

The project follows these coding standards to ensure readability and maintainability:

### Naming Conventions
- Use specific, descriptive, succinct names that convey purpose
- Choose concrete over abstract names (e.g., `canListenOnPort` vs `serverCanStart`)
- Include important attributes like units or state (e.g., `unsafeUrl`, `safeUrl`)
- Use `is/has/can/should` prefixes for boolean variables
- Scope dictates name length (shorter names for smaller scope)
- Use `first/last` for inclusive ranges, `begin/end` for inclusive/exclusive ranges

### Code Structure
- Similar code should have similar visual structure
- Use line breaks to segment logical blocks for better comprehension
- Maintain consistent formatting and indentation
- Minimize scope of variables to reduce mental overhead
- Prefer "write-once" variables to aid reasoning about code

### Control Flow
- Left-hand side should be expressions being interrogated
- Right-hand side should be constant expressions or comparables
- Use ternary operations only for simple cases
- Prefer `while` loops to `do/while` loops
- Avoid deep nesting; refactor or return early instead
- When ordering `if/else`, consider:
  - Dealing with positive case first
  - Dealing with simpler case first
  - Handling most relevant/interesting case first

### Commenting
- Comments should help readers understand the code as well as the writer did
- Appropriate uses include:
  - High-level explanations of code purpose
  - Recording thought process
  - Explanations for counterintuitive code
  - Guidance for future developers (e.g., `TODO`, `FIXME`, `HACK`, `XXX`)
  - Warnings about unexpected behaviors
  - Input/output examples

### Refactoring Principles
- Extract unrelated subproblems from methods
- Separate generic code from project-specific code
- Move utility functions to appropriate utility collections
- Modularize code to maintain decoupling between subsystems

### Testing Considerations
- Write test code that is readable and maintainable
- Provide descriptive error messages in tests
- Choose simple but effective test cases
- Create granular tests to facilitate debugging
- Use descriptive test names (e.g., `Test_<functionName>_<scenario>`)
- Design code to be testable (well-defined interfaces, minimal setup)