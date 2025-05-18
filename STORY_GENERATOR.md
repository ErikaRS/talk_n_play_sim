# Talk 'n Play Story Generator

This tool generates interactive children's stories in the Talk 'n Play format with illustrations using OpenAI's GPT-4 and DALL-E models.

## Prerequisites

To use this script, you need:

1. Node.js installed on your system
2. An OpenAI API key with access to GPT-4 and DALL-E models

## Setup

1. Install required dependencies:

```bash
npm install
```

2. Make the script executable:

```bash
chmod +x scripts/generate-story.js
```

3. Set your OpenAI API key (optional):

```bash
export OPENAI_API_KEY="your-api-key-here"
```

If you don't set the API key as an environment variable, the script will prompt you for it when run.

## Usage

### Basic Usage

Run the script with no arguments to generate a story with default themes:

```bash
npm run generate-story
```

### Custom Theme

Provide a theme for your story:

```bash
npm run generate-story -- "Underwater adventure with sea creatures"
```

### From Your Code

You can also import and use the generator programmatically:

```javascript
const { generateStory } = require('./scripts/generate-story');

// Generate a story with a custom theme
generateStory("Space exploration and friendship")
  .then(result => {
    console.log(`Generated story: ${result.title}`);
  })
  .catch(error => {
    console.error("Failed to generate story:", error);
  });
```

## Output

The script creates:

1. A new directory in `public/stories/` named after your story
2. A markdown file with the formatted story content
3. An illustration style guide markdown file to ensure visual consistency
4. PNG images for each page of the story (page1.png, page2.png, etc.)

## How It Works

The story generation process follows these steps:

1. **Story Idea Generation**: Creates an outline with title, characters, and plot points
2. **Full Story Creation**: Converts the outline into a complete formatted story with color choices
3. **Style Guide Generation**: Creates a comprehensive art direction guide based on the story to ensure visual consistency
4. **Illustration Creation**: Generates illustrations for each page using the style guide and page content
5. **Saving Output**: Saves all files to the appropriate directory structure

## Illustration Style Guide

The script now generates a detailed style guide before creating the illustrations. This ensures:

- **Visual Consistency**: All illustrations maintain a cohesive look and feel
- **Character Continuity**: Characters appear the same across all pages
- **Color Harmony**: A defined color palette is used throughout the story
- **Appropriate Style**: The illustration style matches the tone and themes of the story

The style guide includes:
- Overall visual style definition
- Character design specifications
- Environment design guidelines
- Color palette recommendations
- Composition and framing guidance
- Lighting and mood direction

## Story Format

The generated stories follow the Talk 'n Play format:

- 10 pages per story
- Each page has:
  - A main story section ("Fixed text")
  - Four character-specific paths (Green, Yellow, Red, Blue)
  - An accompanying illustration
- Color choices let the reader follow different character perspectives
- Paths diverge and converge naturally to maintain story flow

## Customization

You can modify the `generateStoryIdea`, `generateFullStory`, and `generateStyleGuide` functions in the script to adjust:

- The number of pages
- The tone and style of the stories
- The complexity level
- The target age range
- Any specific themes to include or avoid
- Illustration style preferences

## API Cost Considerations

This script makes multiple calls to OpenAI's API:

- 1 call to generate a story idea
- 1 call to generate the full story
- 1 call to generate the illustration style guide
- 10 calls to generate images (one per page)

Be aware of your OpenAI API usage limits and costs when running this script.

## Troubleshooting

- **API Key Issues**: Ensure your OpenAI API key is valid and has access to GPT-4 and DALL-E models
- **Rate Limiting**: If you receive rate limit errors, adjust the delay between API calls
- **Image Generation Failures**: Check that your image prompts aren't triggering content filters