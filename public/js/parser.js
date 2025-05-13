// Story Data Models and Parser

/**
 * Story model that holds all pages and provides access to them
 */
class Story {
    constructor(title = '') {
        this.title = title;
        this.pages = [];
    }
    
    isValid() {
        return this.pages.length > 0;
    }
    
    getPage(index) {
        if (index < 0 || index >= this.pages.length) return null;
        return this.pages[index];
    }
}

/**
 * Page model representing a single page in the story
 */
class Page {
    constructor(pageNumber, image, fixedText) {
        this.pageNumber = pageNumber || '';
        this.image = image || '';
        this.fixedText = fixedText || '';
        this.green = '';
        this.yellow = '';
        this.red = '';
        this.blue = '';
    }
    
    getColorText(color) {
        return this[color] || '';
    }
}

/**
 * Parse and format markdown text
 */
class MarkdownParser {
    static toHtml(text) {
        if (!text) return '';
        
        let html = text.replace(/\n/g, '<br>');
        
        // Replace color-specific bold text with colored text
        if (typeof CONFIG !== 'undefined' && CONFIG.colors) {
            CONFIG.colors.forEach(color => {
                html = html.replace(
                    new RegExp(`\\*\\*(${color})\\*\\*`, 'gi'), 
                    `<strong class="${color}-color">$1</strong>`
                );
            });
        }
        
        // Convert remaining markdown
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); // Bold
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');             // Italic
        
        return html;
    }
    
    static parseStory(markdown, colors = ['green', 'yellow', 'red', 'blue']) {
        if (!markdown) return new Story();
        
        // Extract title
        const titleMatch = markdown.match(/# Story Title\s*\n([^\n]+)/i);
        const story = new Story(titleMatch?.[1]?.trim());
        
        // Split into page sections and parse each one
        const pageSections = markdown.split(/## Page\s*\n/).slice(1);
        
        story.pages = pageSections.map(section => {
            // Extract basic page info
            const pageNumberMatch = section.match(/^([^\n]+)/i);
            const imageMatch = section.match(/### Image\s*\n([^\n]+)/i);
            const fixedTextMatch = section.match(/### Fixed text\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            
            const page = new Page(
                pageNumberMatch?.[1]?.trim(),
                imageMatch?.[1]?.trim(),
                fixedTextMatch?.[1]?.trim()
            );
            
            // Extract color-specific text
            colors.forEach(color => {
                const colorMatch = section.match(
                    new RegExp(`### ${color}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n---|$)`, 'i')
                );
                if (colorMatch?.[1]) {
                    page[color] = colorMatch[1].trim();
                }
            });
            
            return page;
        });
        
        return story;
    }
}

// Export models for environments with module support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { Story, Page, MarkdownParser };
}