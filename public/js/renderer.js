// Story Rendering Module

/**
 * Handles rendering story content to the DOM
 */
class StoryRenderer {
    constructor(elements) {
        this.elements = elements;
    }
    
    /**
     * Renders basic page content with fixed text and image
     */
    renderPage(page, storyFolder) {
        if (!page) return false;
        
        // Set text content
        this.elements.leftPage.innerHTML = `<p>${MarkdownParser.toHtml(page.fixedText)}</p>`;
        
        // Set image if available
        if (page.image) {
            const imagePath = `${storyFolder}${page.image}`;
            this.elements.rightPage.innerHTML = `<img src="${imagePath}" alt="Page ${page.pageNumber} image">`;
        } else {
            this.elements.rightPage.innerHTML = '';
        }
        
        return true;
    }
    
    /**
     * Renders page content with color-specific text
     */
    renderPageWithColor(page, color) {
        if (!page) return false;
        
        const colorText = page.getColorText(color);
        if (!colorText) return false;
        
        // Format the color name (capitalize first letter)
        const displayColor = color.charAt(0).toUpperCase() + color.slice(1);
        
        // Show fixed text + color-specific text
        this.elements.leftPage.innerHTML = (
            `<p>${MarkdownParser.toHtml(page.fixedText)}</p>` +
            `<p class="color-text"><span class="${color}-color">${displayColor}</span>: ` +
            `${MarkdownParser.toHtml(colorText)}</p>`
        );
        
        return true;
    }
    
    /**
     * Renders an error message
     */
    renderError(message) {
        this.elements.leftPage.innerHTML = `<p>${message}</p>`;
        this.elements.rightPage.innerHTML = '';
        return true;
    }
    
    /**
     * Updates the state of navigation buttons
     */
    updateNavigation(canGoPrevious, canGoNext) {
        if (this.elements.navPrev) {
            this.elements.navPrev.disabled = !canGoPrevious;
        }
        
        if (this.elements.navNext) {
            this.elements.navNext.disabled = !canGoNext;
        }
    }
    
    /**
     * Updates the active color button
     */
    updateColorButtons(activeColor) {
        if (!this.elements.colorButtons) return;
        
        this.elements.colorButtons.forEach(btn => btn.classList.remove('active'));
        
        if (activeColor) {
            const activeBtn = document.getElementById(activeColor);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }
}

// Export for environments with module support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { StoryRenderer };
}