// Script to load story content and handle button interactions
document.addEventListener('DOMContentLoaded', () => {
    const colorButtons = document.querySelectorAll('.color-btn');
    const leftPage = document.querySelector('.left-page');
    
    // Load story content from markdown file
    loadStoryContent();
    
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            colorButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            button.classList.add('active');
        });
    });
    
    // Function to load and parse the story content
    async function loadStoryContent() {
        try {
            const response = await fetch('/stories/The_Great_Playground_Mystery/The_Great_Playground_Mystery.md');
            if (!response.ok) {
                throw new Error(`Failed to load story content: ${response.status}`);
            }
            
            const markdown = await response.text();
            const storyStructure = parseMarkdownToStructure(markdown);
            
            // Log the parsed structure to console
            console.log('Parsed Story Structure:', storyStructure);
            
            // Display the fixed text from the first page
            if (storyStructure && storyStructure.pages.length > 0) {
                const firstPage = storyStructure.pages[0];
                leftPage.innerHTML = `<p>${firstPage.fixedText}</p>`;
            } else {
                leftPage.innerHTML = '<p>Story content could not be loaded.</p>';
            }
        } catch (error) {
            console.error('Error loading story:', error);
            leftPage.innerHTML = '<p>Error loading story content.</p>';
        }
    }
    
    // Function to parse the markdown into a structured object
    function parseMarkdownToStructure(markdown) {
        const storyStructure = {
            storyTitle: '',
            pages: []
        };
        
        // Extract story title
        const titleMatch = markdown.match(/# Story Title\s*\n([^\n]+)/i);
        if (titleMatch && titleMatch[1]) {
            storyStructure.storyTitle = titleMatch[1].trim();
        }
        
        // Split by page sections
        const pageSections = markdown.split(/## Page\s*\n/);
        
        // Skip the first section (it contains the title)
        for (let i = 1; i < pageSections.length; i++) {
            const pageSection = pageSections[i];
            const page = {
                pageNumber: '',
                image: '',
                fixedText: '',
                green: '',
                yellow: '',
                red: '',
                blue: ''
            };
            
            // Extract page number
            const pageNumberMatch = pageSection.match(/^([^\n]+)/i);
            if (pageNumberMatch && pageNumberMatch[1]) {
                page.pageNumber = pageNumberMatch[1].trim();
            }
            
            // Extract image
            const imageMatch = pageSection.match(/### Image\s*\n([^\n]+)/i);
            if (imageMatch && imageMatch[1]) {
                page.image = imageMatch[1].trim();
            }
            
            // Extract fixed text
            const fixedTextMatch = pageSection.match(/### Fixed text\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (fixedTextMatch && fixedTextMatch[1]) {
                page.fixedText = fixedTextMatch[1].trim();
            }
            
            // Extract green option
            const greenMatch = pageSection.match(/### Green\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (greenMatch && greenMatch[1]) {
                page.green = greenMatch[1].trim();
            }
            
            // Extract yellow option
            const yellowMatch = pageSection.match(/### Yellow\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (yellowMatch && yellowMatch[1]) {
                page.yellow = yellowMatch[1].trim();
            }
            
            // Extract red option
            const redMatch = pageSection.match(/### Red\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (redMatch && redMatch[1]) {
                page.red = redMatch[1].trim();
            }
            
            // Extract blue option
            const blueMatch = pageSection.match(/### Blue\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (blueMatch && blueMatch[1]) {
                page.blue = blueMatch[1].trim();
            }
            
            storyStructure.pages.push(page);
        }
        
        return storyStructure;
    }
});