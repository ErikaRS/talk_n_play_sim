// Script to load story content and handle button interactions
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const colorButtons = document.querySelectorAll('.color-btn');
    const leftPage = document.querySelector('.left-page');
    const rightPage = document.querySelector('.right-page');
    const navLeftBtn = document.getElementById('nav-left');
    const navRightBtn = document.getElementById('nav-right');
    
    // Story state
    let storyData = null;
    let currentPageIndex = 0;
    
    // Load story content from markdown file
    loadStoryContent();
    
    // Initialize button listeners
    initializeButtons();
    
    function initializeButtons() {
        // Color button listeners
        colorButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                colorButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to the clicked button
                button.classList.add('active');
                
                // Handle color button actions based on button ID
                const buttonId = button.id;
                // This will be implemented later
            });
        });
        
        // Navigation button listeners
        navLeftBtn.addEventListener('click', () => {
            // Previous page functionality will be implemented later
        });
        
        navRightBtn.addEventListener('click', () => {
            // Next page functionality will be implemented later
        });
    }
    
    // Function to load and parse the story content
    async function loadStoryContent() {
        try {
            const response = await fetch('/stories/The_Great_Playground_Mystery/The_Great_Playground_Mystery.md');
            if (!response.ok) {
                throw new Error(`Failed to load story content: ${response.status}`);
            }
            
            const markdown = await response.text();
            storyData = parseMarkdownToStructure(markdown);
            
            // Log the parsed structure to console
            console.log('Parsed Story Structure:', storyData);
            
            // Display the first page
            displayCurrentPage();
        } catch (error) {
            console.error('Error loading story:', error);
            leftPage.innerHTML = '<p>Error loading story content.</p>';
        }
    }
    
    // Function to display the current page based on currentPageIndex
    function displayCurrentPage() {
        if (!storyData || !storyData.pages || storyData.pages.length === 0) {
            leftPage.innerHTML = '<p>Story content could not be loaded.</p>';
            return;
        }
        
        if (currentPageIndex < 0 || currentPageIndex >= storyData.pages.length) {
            console.error('Invalid page index:', currentPageIndex);
            return;
        }
        
        const currentPage = storyData.pages[currentPageIndex];
        
        // Update text content
        leftPage.innerHTML = `<p>${currentPage.fixedText}</p>`;
        
        // Update image if available
        if (currentPage.image) {
            const imagePath = `/stories/The_Great_Playground_Mystery/${currentPage.image}`;
            rightPage.innerHTML = `<img src="${imagePath}" alt="Page ${currentPage.pageNumber} image">`;
        } else {
            rightPage.innerHTML = '';
        }
        
        // Update UI state based on navigation availability
        updateNavigationState();
    }
    
    // Function to update the navigation buttons state
    function updateNavigationState() {
        // Disable prev button if we're on the first page
        navLeftBtn.disabled = currentPageIndex <= 0;
        
        // Disable next button if we're on the last page
        navRightBtn.disabled = currentPageIndex >= storyData.pages.length - 1;
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