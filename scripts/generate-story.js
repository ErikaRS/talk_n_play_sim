#!/usr/bin/env node

/**
 * OpenAI-powered Story Generator for Talk 'n Play Sim (using OpenAI npm package)
 * 
 * This script generates interactive children's stories in the Talk 'n Play format
 * with parallel story tracks for different characters (color choices).
 * It also generates illustrations for each page using DALL-E, based on a consistent style guide.
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { OpenAI } = require('openai');

// Character colors available in the Talk 'n Play format
const COLORS = ['green', 'yellow', 'red', 'blue'];
const PAGE_COUNT = 10;

// Read API key from environment or prompt user
function getApiKey() {
  return new Promise((resolve) => {
    if (process.env.OPENAI_API_KEY) {
      console.log('Using OpenAI API key from environment variable');
      resolve(process.env.OPENAI_API_KEY);
      return;
    }
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Enter your OpenAI API key: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Initialize OpenAI client
async function initOpenAI() {
  const apiKey = await getApiKey();
  return new OpenAI({ apiKey });
}

// Generate a story idea and basic outline
async function generateStoryIdea(openai, userTheme) {
  console.log('Generating story idea...');
  
  const prompt = `
Create a children's story outline for a Talk 'n Play interactive story book. 
The story should feature four main characters that will each have their own story track.

Theme guidance: ${userTheme || 'Create a fun adventure story for young children'}

The story should:
- Be appropriate for children ages 3-7
- Have a clear beginning, middle, and end
- Include 8-10 pages (scenes)
- Feature 4 main characters who can each have their own path through the story
- Include light problem-solving, exploration, and friendship themes
- Avoid scary content, complicated plots, or mature themes

For each page, there will be a main scene description and 4 different character-specific continuations.

Provide an outline with:
1. Story title
2. Brief plot summary (2-3 sentences)
3. Main characters (4 characters with quick description)
4. Theme/moral
5. Brief outline of 8-10 key scenes
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "You are a children's book author specialized in interactive, branching narrative books." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });
  
  return response.choices[0].message.content;
}

// Generate the full story content in the Talk 'n Play markdown format
async function generateFullStory(openai, storyIdea) {
  console.log('Generating full story content...');
  
  const prompt = `
Generate a complete Talk 'n Play interactive children's story based on this outline:

${storyIdea}

Format the story EXACTLY as follows:

# Story Title  
[Story Title Here]

## Page  
Page 1  

### Image  
page1.png  

### Fixed text  
[Main story text for page 1, ending with a prompt for the reader to select a color]
Select **green** to [green option description].  
Select **yellow** to [yellow option description].  
Select **red** to [red option description].  
Select **blue** to [blue option description].

### Green  
[What happens when the green option is selected - 1-2 sentences]

### Yellow  
[What happens when the yellow option is selected - 1-2 sentences]

### Red  
[What happens when the red option is selected - 1-2 sentences]

### Blue  
[What happens when the blue option is selected - 1-2 sentences]

---

## Page  
Page 2  

[Continue same format for each page]

IMPORTANT REQUIREMENTS:
1. Color choices should offer meaningful variations but lead to a similar outcome that converges on the next page
2. Each color option should be appropriate for their character but equally fun/valuable
3. The Fixed text should end with a clear prompt to select a color
4. Each color section should be 1-2 sentences only
5. Maintain a consistent, cheerful tone throughout
6. Include exactly ${PAGE_COUNT} pages
7. Do not include the actual images, just the 'page1.png', 'page2.png', etc. placeholders
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "You are a children's book author specialized in interactive, branching narrative books." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000
  });
  
  return response.choices[0].message.content;
}

// Generate an illustration style guide based on the full story
async function generateStyleGuide(openai, storyTitle, storyContent, mainCharacters) {
  console.log('Generating illustration style guide...');
  
  // Extract a summary from the story content by taking the first paragraph of fixed text from a few pages
  const pageSections = storyContent.split(/## Page\s*\n/).slice(1);
  const pageSamples = [0, Math.floor(pageSections.length / 2), pageSections.length - 1] // First, middle, last
    .map(i => {
      const fixedTextMatch = pageSections[i].match(/### Fixed text\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
      return fixedTextMatch?.[1]?.trim().split('\n')[0] || '';
    })
    .filter(text => text)
    .join('\n\n');
  
  const styleGuidePrompt = `
Create a detailed illustration style guide for a children's picture book titled "${storyTitle}".

Based on these story excerpts:
${pageSamples}

Generate a comprehensive art style guide that includes:

1. Overall Visual Style: Define a cohesive art style appropriate for 3-7 year olds (e.g., watercolor, digital illustration, cartoon)
2. Character Design: Detailed descriptions for the main characters, including:
   - Character appearances, distinctive features, outfits, colors
   - Consistent character proportions and expressions
3. Environment Design: Guidance for settings and backgrounds
4. Color Palette: 6-8 main colors to use across all illustrations
5. Textures and Techniques: Special visual elements to maintain consistency
6. Composition Guidelines: How to frame and arrange scenes
7. Lighting and Mood: The overall atmosphere across illustrations

The style guide should ensure all illustrations maintain a consistent and cohesive look across multiple pages.

Remember that these are interactive children's stories with four color-coded character paths (green, yellow, red, blue).

Format your response as a detailed guide a professional illustrator would follow.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "You are an art director for children's books with expertise in creating style guides for illustrators." },
      { role: "user", content: styleGuidePrompt }
    ],
    temperature: 0.7,
    max_tokens: 1500
  });
  
  return response.choices[0].message.content;
}

// Generate image for a specific page using the style guide
async function generatePageImage(openai, story, styleGuide, pageNumber, pageContent) {
  console.log(`Generating image for page ${pageNumber}...`);
  
  // Extract fixed text for this page to use in image generation
  const fixedTextMatch = pageContent.match(/### Fixed text\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
  const fixedText = fixedTextMatch?.[1]?.trim() || '';
  
  // Create a prompt that incorporates the style guide
  let imagePrompt = `
Create a children's book illustration for page ${pageNumber} of "${story.title}" that follows this style guide:

${styleGuide.substring(0, 500)}... (style guide continues)

Illustrate this specific scene:
${fixedText.substring(0, 500)}

IMPORTANT:
- Follow the style guide precisely to maintain consistency with other illustrations
- Focus on the main elements of the scene described
- Make the image friendly and appealing to children ages 3-7
- Do not include any text in the image
- Ensure characters are consistent with their descriptions in the style guide
`;

  // Trim prompt if it's too long
  if (imagePrompt.length > 1000) {
    imagePrompt = imagePrompt.substring(0, 1000);
  }

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: imagePrompt,
    n: 1,
    size: "1024x1024",
    response_format: "url"
  });
  
  return response.data[0].url;
}

// Download an image from a URL
async function downloadImage(url, filePath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const buffer = await response.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(buffer));
}

// Parse story title from the generated markdown
function parseStoryTitle(markdown) {
  const titleMatch = markdown.match(/# Story Title\s*\n([^\n]+)/i);
  return titleMatch?.[1]?.trim() || 'Untitled_Story';
}

// Extract main characters from the story idea
function extractMainCharacters(storyIdea) {
  // Look for a section about characters, often after "Main characters" or similar
  const characterMatch = storyIdea.match(/(?:characters|protagonists|main characters):\s*([\s\S]*?)(?=\d\.|$)/i);
  if (!characterMatch) return [];
  
  // Split by numbers, bullets, or dashes to get individual character entries
  const characterText = characterMatch[1];
  const characters = characterText.split(/(?:\d+\.|\-|\*)\s+/).filter(c => c.trim().length > 0);
  
  return characters.map(c => c.trim());
}

// Split story into pages
function splitStoryPages(markdown) {
  return markdown.split(/## Page\s*\n/).slice(1);
}

// Create files for the story
async function saveStory(storyContent, styleGuide, imageUrls) {
  const title = parseStoryTitle(storyContent);
  const safeTitle = title.replace(/[^a-z0-9]/gi, '_');
  const storyDir = path.join(__dirname, '..', 'public', 'stories', safeTitle);
  
  // Create directory for the story
  try {
    await fs.mkdir(storyDir, { recursive: true });
    console.log(`Created directory: ${storyDir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  
  // Save markdown file
  const mdPath = path.join(storyDir, `${safeTitle}.md`);
  await fs.writeFile(mdPath, storyContent);
  console.log(`Saved story to ${mdPath}`);
  
  // Save style guide
  const stylePath = path.join(storyDir, `${safeTitle}_style_guide.md`);
  await fs.writeFile(stylePath, styleGuide);
  console.log(`Saved style guide to ${stylePath}`);
  
  // Download and save images
  for (let i = 0; i < imageUrls.length; i++) {
    const imageNumber = i + 1;
    const imagePath = path.join(storyDir, `page${imageNumber}.png`);
    await downloadImage(imageUrls[i], imagePath);
    console.log(`Saved image for page ${imageNumber} to ${imagePath}`);
  }
  
  return { storyDir, title: safeTitle };
}

// Main function to orchestrate the story generation process
async function generateStory(theme) {
  try {
    // Step 1: Initialize OpenAI
    const openai = await initOpenAI();
    
    // Step 2: Generate story idea
    const storyIdea = await generateStoryIdea(openai, theme);
    console.log('\nStory Idea Generated:');
    console.log('--------------------');
    console.log(storyIdea);
    console.log('--------------------\n');
    
    // Step 3: Generate full story content
    const storyContent = await generateFullStory(openai, storyIdea);
    
    // Step 4: Parse story for image generation
    const storyTitle = parseStoryTitle(storyContent);
    const mainCharacters = extractMainCharacters(storyIdea);
    const storyPages = splitStoryPages(storyContent);
    
    // Step 5: Generate style guide for illustrations
    const styleGuide = await generateStyleGuide(openai, storyTitle, storyContent, mainCharacters);
    console.log('\nStyle Guide Generated:');
    console.log('--------------------');
    console.log(styleGuide);
    console.log('--------------------\n');
    
    // Step 6: Generate images for each page using the style guide
    const imageUrls = [];
    for (let i = 0; i < storyPages.length; i++) {
      const pageNumber = i + 1;
      const imageUrl = await generatePageImage(
        openai,
        { title: storyTitle }, 
        styleGuide,
        pageNumber, 
        storyPages[i]
      );
      imageUrls.push(imageUrl);
      
      // Add a short delay to avoid rate limiting
      if (i < storyPages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Step 7: Save story, style guide, and images
    const savedStory = await saveStory(storyContent, styleGuide, imageUrls);
    
    console.log('\n✨ Story generation complete! ✨');
    console.log(`Title: ${storyTitle}`);
    console.log(`Pages: ${storyPages.length}`);
    console.log(`Saved to: ${savedStory.storyDir}`);
    
    return savedStory;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  // Get theme from command line argument
  const theme = process.argv[2] || '';
  
  generateStory(theme)
    .then(() => {
      console.log('Story generation completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Story generation failed:', err);
      process.exit(1);
    });
}

module.exports = {
  generateStory
};