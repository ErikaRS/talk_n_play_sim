// Simple script to toggle active state on buttons
document.addEventListener('DOMContentLoaded', () => {
    const colorButtons = document.querySelectorAll('.color-btn');
    
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            colorButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            button.classList.add('active');
        });
    });
});