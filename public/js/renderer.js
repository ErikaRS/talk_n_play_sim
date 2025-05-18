// Story Rendering Module

/**
 * Handles rendering story content to the DOM
 * Responsible for updating the UI based on story state
 */
class StoryRenderer {
    /**
     * Create a new renderer with references to DOM elements
     * @param {Object} elements - DOM elements that will be updated
     */
    constructor(elements) {
        this.elements = elements;
    }
    
    /**
     * Renders basic page content with fixed text and image
     * @param {Page} page - The page object to render
     * @param {string} storyFolder - The folder path containing story assets
     * @returns {boolean} True if rendering succeeded, false otherwise
     */
    renderPage(page, storyFolder) {
        if (!page) {
            return false;
        }
        
        // Set text content in the left page area
        const formattedText = MarkdownParser.toHtml(page.fixedText);
        this.elements.leftPage.innerHTML = `<p>${formattedText}</p>`;
        
        // Set image in the right page area if available
        if (page.image) {
            const imagePath = `${storyFolder}${page.image}`;
            const imageHtml = `<img src="${imagePath}" alt="Page ${page.pageNumber} image">`;
            this.elements.rightPage.innerHTML = imageHtml;
        } else {
            this.elements.rightPage.innerHTML = '';
        }
        
        return true;
    }
    
    /**
     * Renders page content with color-specific text for the selected character
     * @param {Page} page - The page object to render
     * @param {string} color - The selected color/character
     * @returns {boolean} True if rendering succeeded, false otherwise
     */
    renderPageWithColor(page, color) {
        if (!page) {
            return false;
        }
        
        const colorText = page.getColorText(color);
        if (!colorText) {
            return false;
        }
        
        // Format the color name (capitalize first letter)
        const displayColor = color.charAt(0).toUpperCase() + color.slice(1);
        
        // Format the fixed and color-specific text
        const fixedHtml = MarkdownParser.toHtml(page.fixedText);
        const colorHtml = MarkdownParser.toHtml(colorText);
        
        // Show fixed text + color-specific text
        this.elements.leftPage.innerHTML = (
            `<p>${fixedHtml}</p>` +
            `<p class="color-text"><span class="${color}-color">${displayColor}</span>: ${colorHtml}</p>`
        );
        
        return true;
    }
    
    /**
     * Renders an error message when something goes wrong
     * @param {string} message - The error message to display
     * @returns {boolean} Always returns true
     */
    renderError(message) {
        this.elements.leftPage.innerHTML = `<p>${message}</p>`;
        this.elements.rightPage.innerHTML = '';
        return true;
    }
    
    /**
     * Updates the state of navigation buttons based on current page position
     * @param {boolean} canGoPrevious - Whether previous navigation is possible
     * @param {boolean} canGoNext - Whether next navigation is possible
     */
    updateNavigation(canGoPrevious, canGoNext) {
        // Update previous button state if it exists
        if (this.elements.navPrev) {
            this.elements.navPrev.disabled = !canGoPrevious;
        }
        
        // Update next button state if it exists
        if (this.elements.navNext) {
            this.elements.navNext.disabled = !canGoNext;
        }
    }
    
    /**
     * Updates the active color button to reflect current selection
     * @param {string} activeColor - The currently selected color
     */
    updateColorButtons(activeColor) {
        if (!this.elements.colorButtons) {
            return;
        }
        
        // Remove active class from all buttons
        this.elements.colorButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to the currently selected color button
        if (activeColor) {
            const activeBtn = document.getElementById(activeColor);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
    }
    
    /**
     * Highlights the currently active story in the story picker
     * @param {string} storyTitle - The title of the active story
     */
    updateStorySelection(storyTitle) {
        if (!this.elements.storyList) {
            return;
        }
        
        // Get all story items in the list
        const storyItems = this.elements.storyList.querySelectorAll('.story-item');
        
        // Update the selection state for each item
        storyItems.forEach(item => {
            // Remove selection from all items
            item.classList.remove('selected');
            
            // Add selection to the matching item
            if (item.textContent === storyTitle) {
                item.classList.add('selected');
            }
        });
    }
}

// Export for environments with module support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { StoryRenderer };
}