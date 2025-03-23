document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const narratorText = document.getElementById('narrator-text');
    const narratorSpeakBtn = document.getElementById('narrator-speak');
    const pageImage = document.getElementById('page-image');
    const characterButtons = document.querySelectorAll('.character-btn');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    // State variables
    let currentPage = 1;
    let currentCharacter = null;
    let characterHistory = [];
    let choiceTimeout = null;
    let isAtChoicePoint = true;
    
    // Speech synthesis setup
    const synth = window.speechSynthesis;
    
    // Initialize the app
    initApp();
    
    // Function to initialize the application
    function initApp() {
        // Set up the first page
        updatePage(currentPage);
        
        // Set up event listeners
        setupEventListeners();
        
        // Start with narrator introduction
        speakNarratorText();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Character button listeners
        characterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const character = button.getAttribute('data-character');
                selectCharacter(character);
            });
        });
        
        // Narrator speak button
        narratorSpeakBtn.addEventListener('click', speakNarratorText);
        
        // Navigation buttons
        prevPageBtn.addEventListener('click', goToPreviousPage);
        nextPageBtn.addEventListener('click', goToNextPage);
    }
    
    // Select a character track
    function selectCharacter(character) {
        // Clear any existing timeout
        if (choiceTimeout) {
            clearTimeout(choiceTimeout);
            choiceTimeout = null;
        }
        
        // Update the current character
        currentCharacter = character;
        characterHistory[currentPage - 1] = character;
        
        // Highlight the selected character button
        characterButtons.forEach(button => {
            const buttonCharacter = button.getAttribute('data-character');
            if (buttonCharacter === character) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Play character sound
        playCharacterSound(character);
        
        // Update the display with selected character track
        updateStoryDisplay();
        
        // Enable next button if we're at a choice point
        if (isAtChoicePoint) {
            nextPageBtn.disabled = false;
        }
    }
    
    // Update the page display
    function updatePage(pageNumber) {
        // Get the page data
        const page = storyData.pages[pageNumber - 1];
        if (!page) return;
        
        // Update the page image
        // In a real implementation, we'd have actual images. For this prototype,
        // we'll use a placeholder or generate a simple visual
        pageImage.src = `public/images/${page.image}`;
        pageImage.alt = page.description;
        
        // Set if we're at a choice point
        isAtChoicePoint = page.isChoicePoint;
        
        // Update the narrator text
        narratorText.textContent = page.narratorIntro;
        
        // Check if we have a previous character selection for this page
        const previousCharacter = characterHistory[pageNumber - 1];
        if (previousCharacter) {
            currentCharacter = previousCharacter;
            
            // Highlight the previously selected character
            characterButtons.forEach(button => {
                const buttonCharacter = button.getAttribute('data-character');
                if (buttonCharacter === previousCharacter) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
            // Update the story display
            updateStoryDisplay();
        } else {
            // No previous selection, reset display
            characterButtons.forEach(button => button.classList.remove('active'));
            currentCharacter = null;
            
            // Start timeout for default selection
            if (isAtChoicePoint) {
                startChoiceTimeout();
            }
        }
        
        // Update navigation buttons
        prevPageBtn.disabled = pageNumber <= 1;
        nextPageBtn.disabled = !currentCharacter || pageNumber >= storyData.totalPages;
        
        // If this is the last page, we want to enable the next button for any selection
        if (pageNumber >= storyData.totalPages && currentCharacter) {
            nextPageBtn.disabled = false;
        }
    }
    
    // Update story display based on current character
    function updateStoryDisplay() {
        if (!currentCharacter) return;
        
        const page = storyData.pages[currentPage - 1];
        const track = page.tracks[currentCharacter];
        
        if (track) {
            // Create a text node in the book container to display the story
            const storyDisplay = document.createElement('div');
            storyDisplay.className = 'story-text';
            storyDisplay.textContent = track.text;
            
            // Clear any existing story text
            const existingStoryText = document.querySelector('.story-text');
            if (existingStoryText) {
                existingStoryText.remove();
            }
            
            // Add the new story text
            document.getElementById('page-image-container').appendChild(storyDisplay);
            
            // Update narrator text to follow-up
            narratorText.textContent = track.narratorFollowUp;
            
            // Reset the timeout for next default selection
            if (isAtChoicePoint) {
                startChoiceTimeout();
            }
        }
    }
    
    // Go to previous page
    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            updatePage(currentPage);
            speakNarratorText();
        }
    }
    
    // Go to next page
    function goToNextPage() {
        if (currentPage < storyData.totalPages) {
            currentPage++;
            updatePage(currentPage);
            speakNarratorText();
        } else {
            // End of story
            endStory();
        }
    }
    
    // End the story
    function endStory() {
        narratorText.textContent = "That's the end of our adventure! Would you like to start again?";
        speakNarratorText();
        
        // Reset navigation buttons
        prevPageBtn.disabled = false;
        nextPageBtn.disabled = true;
        
        // Add restart button
        const restartBtn = document.createElement('button');
        restartBtn.textContent = "Start Again";
        restartBtn.id = "restart-btn";
        restartBtn.addEventListener('click', () => {
            // Reset state
            currentPage = 1;
            currentCharacter = null;
            characterHistory = [];
            
            // Remove restart button
            restartBtn.remove();
            
            // Update page
            updatePage(currentPage);
            speakNarratorText();
        });
        
        // Add to navigation buttons
        document.querySelector('.navigation-buttons').appendChild(restartBtn);
    }
    
    // Start timeout for default character selection
    function startChoiceTimeout() {
        if (choiceTimeout) {
            clearTimeout(choiceTimeout);
        }
        
        choiceTimeout = setTimeout(() => {
            // If no selection made, use the last selected character
            if (characterHistory.length > 0) {
                const lastCharacter = characterHistory.filter(c => c).pop();
                if (lastCharacter && !currentCharacter) {
                    selectCharacter(lastCharacter);
                }
            }
        }, storyData.defaultTimeoutSeconds * 1000);
    }
    
    // Function to speak narrator text
    function speakNarratorText() {
        if (synth.speaking) {
            synth.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(narratorText.textContent);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        synth.speak(utterance);
    }
    
    // Function to play character sound/voice
    function playCharacterSound(character) {
        if (synth.speaking) {
            synth.cancel();
        }
        
        const characterData = storyData.characters[character];
        if (!characterData) return;
        
        // For this prototype, we'll use speech synthesis to simulate character sounds
        const soundText = characterData.sound;
        const utterance = new SpeechSynthesisUtterance(soundText);
        
        // Adjust voice characteristics based on character
        if (character === "Big Bird") {
            utterance.pitch = 0.8;
            utterance.rate = 0.9;
        } else if (character === "Elmo") {
            utterance.pitch = 1.5;
            utterance.rate = 1.1;
        } else if (character === "Cookie Monster") {
            utterance.pitch = 0.6;
            utterance.rate = 0.8;
        } else if (character === "Oscar") {
            utterance.pitch = 0.7;
            utterance.rate = 0.7;
        }
        
        synth.speak(utterance);
    }
});