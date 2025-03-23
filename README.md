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

## How to Use

1. Open `index.html` in a modern web browser
2. Click on a character button to select which character's story to follow
3. Listen to the narrator and read the story text
4. When prompted, select a character again to continue the story
5. Use the navigation buttons to move between pages

## Technical Implementation

The prototype uses vanilla JavaScript, HTML, and CSS. The key components are:

- `index.html`: Main structure of the application
- `css/style.css`: Styling for the application
- `js/story-data.js`: Story content organized by pages and character tracks
- `js/app.js`: Application logic including character selection, navigation, and speech
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