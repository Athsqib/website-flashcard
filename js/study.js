// ========== STUDY SESSION VARIABLES ==========
let currentSet = null;
let currentCardIndex = 0;
let isFlipped = false;

// ========== STUDY SESSION FUNCTIONS ==========

// Initialize study session
async function initStudySession() {
    // Load sidebar FIRST
    await initPageWithSidebar();

    // Get the selected set from sessionStorage
    const setData = sessionStorage.getItem('currentStudySet');

    if (!setData) {
        // Try to get from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const setId = parseInt(urlParams.get('id'));

        if (setId) {
            let sets = loadFlashcardSets();
            currentSet = sets.find(s => s.id === setId);
        }
    } else {
        currentSet = JSON.parse(setData);
    }

    if (!currentSet) {
        // Redirect back if no set found
        showAlertDialog('No flashcard set selected!', '');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    // Display set title
    const setTitleEl = document.getElementById('setTitle');
    if (setTitleEl) {
        setTitleEl.innerHTML = ` ${escapeHtml(currentSet.name)} <span>• ${currentSet.cards.length} cards</span>`;
    }

    // Update total cards display
    const totalCardsEl = document.getElementById('totalCards');
    if (totalCardsEl) {
        totalCardsEl.textContent = currentSet.cards.length;
    }

    // Load first card
    loadCard();

    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyPress);
}

// Handle keyboard shortcuts
function handleKeyPress(e) {
    // Left arrow key - previous card
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousCard();
    }
    // Right arrow key - next card
    else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextCard();
    }
    // Space bar - flip card
    else if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        flipCard();
    }
    // 'F' key - flip back (hide answer)
    else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        flipBack();
    }
}

// Load current card
function loadCard() {
    if (!currentSet || currentSet.cards.length === 0) return;

    const card = currentSet.cards[currentCardIndex];
    const questionEl = document.getElementById('questionText');
    const answerEl = document.getElementById('answerText');
    const flashcard = document.getElementById('flashcard');
    const cardLabel = document.getElementById('cardLabel');
    const flipHint = document.getElementById('flipHint');

    if (questionEl && answerEl && card) {
        questionEl.textContent = card.question;
        answerEl.textContent = card.answer;
    }

    // Reset flip state to question side
    isFlipped = false;
    if (flashcard) {
        flashcard.classList.remove('show-answer');
        flashcard.classList.add('show-question');
    }
    if (cardLabel) {
        cardLabel.textContent = 'TERM';
        cardLabel.classList.remove('flipped');
    }
    if (flipHint) {
        flipHint.innerHTML = ' Click card or press SPACE to flip ';
    }

    // Update progress display
    updateProgress();

    // Save current progress
    saveProgress();
}

// Flip card to show answer
function flipCard() {
    const flashcard = document.getElementById('flashcard');
    const cardLabel = document.getElementById('cardLabel');
    const flipHint = document.getElementById('flipHint');

    if (!flashcard) return;

    // Add flip animation
    flashcard.classList.add('flip-animation');
    setTimeout(() => {
        flashcard.classList.remove('flip-animation');
    }, 400);

    if (!isFlipped) {
        // Show answer
        flashcard.classList.add('show-answer');
        flashcard.classList.remove('show-question');
        if (cardLabel) {
            cardLabel.textContent = 'ANSWER';
            cardLabel.classList.add('flipped');
        }
        if (flipHint) {
            flipHint.innerHTML = ' Press SPACE or F to flip back ';
        }
        isFlipped = true;
    }
}

// Flip back to question
function flipBack() {
    const flashcard = document.getElementById('flashcard');
    const cardLabel = document.getElementById('cardLabel');
    const flipHint = document.getElementById('flipHint');

    if (!flashcard) return;

    // Only flip back if currently showing answer
    if (isFlipped) {
        // Add flip animation
        flashcard.classList.add('flip-animation');
        setTimeout(() => {
            flashcard.classList.remove('flip-animation');
        }, 400);

        // Hide answer, show question
        flashcard.classList.remove('show-answer');
        flashcard.classList.add('show-question');
        if (cardLabel) {
            cardLabel.textContent = 'TERM';
            cardLabel.classList.remove('flipped');
        }
        if (flipHint) {
            flipHint.innerHTML = ' Click card or press SPACE to flip ';
        }
        isFlipped = false;
    }
}

// Go to next card
function nextCard() {
    if (!currentSet) return;

    // Move to next card
    if (currentCardIndex < currentSet.cards.length - 1) {
        currentCardIndex++;
        loadCard();
        showToast(`️ Card ${currentCardIndex + 1} of ${currentSet.cards.length}`, '#667eea');
    } else {
        // Completed all cards!
        completeSession();
    }
}

// Go to previous card
function previousCard() {
    if (!currentSet) return;

    if (currentCardIndex > 0) {
        currentCardIndex--;
        loadCard();
        showToast(`️ Card ${currentCardIndex + 1} of ${currentSet.cards.length}`, '#667eea');
    } else {
        showToast(' You\'re at the first card!', '#ffa500');
    }
}

// Update progress bar and counter
function updateProgress() {
    const currentNum = document.getElementById('currentCardNum');
    const progressBar = document.getElementById('progressBar');

    if (currentNum) {
        currentNum.textContent = currentCardIndex + 1;
    }

    if (progressBar && currentSet) {
        const percentage = ((currentCardIndex + 1) / currentSet.cards.length) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

// Complete study session
function completeSession() {
    // Hide study area, show completion screen
    const studyArea = document.getElementById('studyArea');
    const completionScreen = document.getElementById('completionScreen');

    if (studyArea) studyArea.classList.add('hidden');
    if (completionScreen) completionScreen.classList.remove('hidden');

    const totalCards = currentSet.cards.length;
    const completionStats = document.getElementById('completionStats');

    if (completionStats) {
        completionStats.innerHTML = `
             Total Cards Reviewed: ${totalCards}<br>
             Great job! Keep up the momentum!
        `;
    }

    sessionStorage.removeItem('currentStudySet');
    document.removeEventListener('keydown', handleKeyPress);

    showAlertDialog(` Congratulations!\n\nYou completed all ${totalCards} flashcards!\n\nGreat job!`, '');
}

// Save current progress
function saveProgress() {
    const progress = {
        setId: currentSet?.id,
        cardIndex: currentCardIndex,
        isFlipped: isFlipped,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('lastStudyProgress', JSON.stringify(progress));
}

// Restart study session (WITH CONFIRMATION)
window.restartSession = function() {
    showConfirmDialog(
        'Restart this study session?\n\nYour progress will be reset to the beginning.',
        () => {
            currentCardIndex = 0;
            isFlipped = false;

            const studyArea = document.getElementById('studyArea');
            const completionScreen = document.getElementById('completionScreen');

            if (studyArea) studyArea.classList.remove('hidden');
            if (completionScreen) completionScreen.classList.add('hidden');

            loadCard();
            document.addEventListener('keydown', handleKeyPress);
            showToast(' Session restarted!', '#667eea');
        }
    );
};

// Make functions global for onclick handlers
window.flipCard = flipCard;
window.previousCard = previousCard;
window.nextCard = nextCard;
window.flipBack = flipBack;

// Initialize study page
if (document.getElementById('studyContainer')) {
    document.addEventListener('DOMContentLoaded', initStudySession);
}

console.log(' study.js loaded with sidebar loader');