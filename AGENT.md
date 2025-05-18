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

### Detailed Style Guide

#### Naming Best Practices
- Use specific, descriptive, succinct names that convey purpose
- Choose concrete over abstract names (e.g., `canListenOnPort` vs `serverCanStart`)
- Include important attributes like units or state (e.g., `unsafeUrl`, `safeUrl`)
- Use `is/has/can/should` prefixes for boolean variables
- Shorter variable names are acceptable for smaller scope
- Use `first/last` for inclusive ranges, `begin/end` for inclusive/exclusive ranges

#### Code Organization
- Maintain consistent visual structure for similar code blocks
- Use line breaks to segment logical blocks for better comprehension
- Group related operations together
- Minimize variable scope to reduce cognitive load
- Prefer immutable "write-once" variables where possible

#### Control Flow Guidelines
- Put expressions being interrogated on the left-hand side
- Put constant expressions or comparables on the right-hand side
- Use ternary operations only for simple cases
- Prefer `while` loops to `do/while` loops
- Avoid deep nesting; refactor or return early instead
- When ordering `if/else`, consider:
  - Handling positive case first
  - Handling simpler case first
  - Handling most relevant case first

#### Simplifying Complex Logic
- Use "explaining variables" to capture subexpressions
- Create "summary variables" for complex conditionals
- Consider applying DeMorgan's Law to simplify boolean expressions
- Extract reusable utility functions
- Minimize temporary variables and return early when possible

#### Testing Guidelines
- Write test code that is readable and maintainable
- Provide descriptive error messages
- Choose simple but effective test cases
- Create granular tests to aid debugging
- Use descriptive test names (e.g., `Test_<functionName>_<scenario>`)
- Design code to be testable with minimal setup

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