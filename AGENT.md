# Agent Instructions for Talk 'n Play Simulator Codebase

## Build/Test Commands
- Run with: `cd public && http-server -c-1 --cors`
- No automated tests present, all testing is manual via browser

## Code Style Guidelines
- **JavaScript**: ES6 syntax, vanilla JS without frameworks
- **Formatting**: 4-space indentation, camelCase variables, function names
- **Imports**: No module system, all scripts loaded via HTML script tags
- **Comments**: Use `// Comment` style, JSDoc for function documentation
- **Error Handling**: Use try/catch with console.error and user-friendly messages
- **Naming**: Descriptive names, with state, elements, and functions separated

## Domain Structure
- **Story Format**: Markdown with fixed text and color-specific branching
- **Project Layout**: public/{css,js,images,stories} structure
- **UI Elements**: Color buttons (green, yellow, red, blue) for branching choices
- **State Management**: Simple JS object with story, currentPageIndex, activeColor

## Core Concepts
- Interactive story selection based on character colors
- Branching narrative with convergence points
- Markdown parsing for story content and formatting

## Instructions to the agent
- Do not automatically commit changes. I always want to manually review them.Commit and push changes if I tell you to