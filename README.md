# Sesame Street Talk 'n Play Simulator

A prototype web application simulating the Sesame Street Talk 'n Play interaction model based on the specification in `spec.md`.

## Overview

This prototype demonstrates the core interaction structure of the Talk 'n Play model:

1. **Four Parallel Story Tracks**: Each following the same visual progression with different character focus
2. **Character-Based Track Selection**: Choose between four Sesame Street characters
3. **Convergent Storytelling Structure**: Stories diverge at choice points then reconverge

## Features

- Interactive story selection via character buttons
- Text-to-speech narration
- Character-specific sounds and voices
- Responsive design for different screen sizes
- Simple navigation controls

## Running the Application

The application needs to be served from a web server. You can use any HTTP server, but we recommend using `http-server`:

1. Install http-server globally using npm:
   ```bash
   npm install -g http-server
   ```

2. Navigate to the project directory and run from the public directory:
   ```bash
   cd public
   http-server -c-1 --cors
   ```

The `-c-1` flag disables caching and `--cors` enables CORS for the text-to-speech functionality.

Note: You can use any other HTTP server of your choice (like Python's SimpleHTTPServer or PHP's built-in server), just make sure to serve the contents of the `public` directory.

## Technical Implementation

The prototype uses vanilla JavaScript, HTML, and CSS. The key components are:

- `public/index.html`: Main structure of the application
- `public/css/style.css`: Styling for the application
- `public/js/story-data.js`: Story content organized by pages and character tracks
- `public/js/app.js`: Application logic including character selection, navigation, and speech
- `public/images/`: Placeholder illustrations for each page

## Browser Support

This prototype requires a modern browser with support for:
- Web Speech API for text-to-speech
- CSS Flexbox for layout
- ES6 JavaScript features

## Future Enhancements

Potential improvements for a production version:
- Higher quality illustrations and animations
- Professional voice acting for characters
- More story pages and branching paths
- Sound effects and background music
- Progress saving functionality
