// ========== DASHBOARD-SPECIFIC FUNCTIONS ==========

let currentGoalSet = null;
let currentGoalCardIndex = 0;
let isGoalFlipped = false;
let dailyMasteredCount = 12; // Starting from 12 as shown in welcome card

// Load goal card from a flashcard set
function loadGoalCard() {
    // Get the goal set from localStorage
    const goalSetId = localStorage.getItem('goalSetId');
    let sets = loadFlashcardSets();

    if (goalSetId) {
        currentGoalSet = sets.find(s => s.id === parseInt(goalSetId));
    }

    // If no goal set set, use the most recent set
    if (!currentGoalSet && sets.length > 0) {
        const sortedSets = [...sets].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        currentGoalSet = sortedSets[0];
        localStorage.setItem('goalSetId', currentGoalSet.id);
    }

    // If still no set, show placeholder
    if (!currentGoalSet || currentGoalSet.cards.length === 0) {
        const questionEl = document.getElementById('goalQuestion');
        const answerEl = document.getElementById('goalAnswer');
        const flashcard = document.getElementById('goalFlashcard');
        const goalHeaderTitle = document.querySelector('.goal-header h2');

        if (questionEl) questionEl.textContent = 'No flashcards available!';
        if (answerEl) answerEl.textContent = 'Create a flashcard set in the Studio to start your daily goal.';
        if (goalHeaderTitle) goalHeaderTitle.innerHTML = ' No Active Goal Set';

        // Disable buttons
        const masteredBtn = document.querySelector('.goal-mastered-btn');
        const skipBtn = document.querySelector('.goal-skip-btn');
        if (masteredBtn) masteredBtn.disabled = true;
        if (skipBtn) skipBtn.disabled = true;

        return;
    }

    // Enable buttons
    const masteredBtn = document.querySelector('.goal-mastered-btn');
    const skipBtn = document.querySelector('.goal-skip-btn');
    if (masteredBtn) masteredBtn.disabled = false;
    if (skipBtn) skipBtn.disabled = false;

    // Update header with set name
    const goalHeaderTitle = document.querySelector('.goal-header h2');
    if (goalHeaderTitle) {
        goalHeaderTitle.innerHTML = ` Goal: ${escapeHtml(currentGoalSet.name)}`;
    }
    const goalHeaderDesc = document.querySelector('.goal-header p');
    if (goalHeaderDesc) {
        goalHeaderDesc.innerHTML = `Master cards from "${escapeHtml(currentGoalSet.name)}" to reach your daily goal!`;
    }

    const card = currentGoalSet.cards[currentGoalCardIndex];
    const questionEl = document.getElementById('goalQuestion');
    const answerEl = document.getElementById('goalAnswer');
    const flashcard = document.getElementById('goalFlashcard');
    const cardLabel = document.getElementById('goalCardLabel');
    const flipHint = document.getElementById('goalFlipHint');

    if (questionEl && answerEl && card) {
        questionEl.textContent = card.question;
        answerEl.textContent = card.answer;
    }

    // Update card label with set icon
    if (cardLabel) {
        let setIcon = '';
        if (currentGoalSet.name.toLowerCase().includes('spanish')) setIcon = '';
        else if (currentGoalSet.name.toLowerCase().includes('react')) setIcon = '️';
        else if (currentGoalSet.name.toLowerCase().includes('science')) setIcon = '';
        else if (currentGoalSet.name.toLowerCase().includes('history')) setIcon = '';
        else if (currentGoalSet.name.toLowerCase().includes('math')) setIcon = '';
        cardLabel.innerHTML = `${setIcon} ${escapeHtml(currentGoalSet.name)}`;
        cardLabel.style.color = '#999';
    }

    // Reset flip state
    isGoalFlipped = false;
    if (flashcard) {
        flashcard.classList.remove('show-answer');
    }
    if (flipHint) {
        flipHint.innerHTML = ' Click to reveal answer ';
    }
}

// Flip goal card
function flipGoalCard() {
    const flashcard = document.getElementById('goalFlashcard');
    const cardLabel = document.getElementById('goalCardLabel');
    const flipHint = document.getElementById('goalFlipHint');

    if (!flashcard) return;

    if (!isGoalFlipped && currentGoalSet && currentGoalSet.cards.length > 0) {
        flashcard.classList.add('show-answer');
        if (cardLabel) {
            cardLabel.style.color = '#667eea';
        }
        if (flipHint) {
            flipHint.innerHTML = ' Answer revealed! Click "Mastered" if you got it right!';
        }
        isGoalFlipped = true;
    }
}

// Mark goal as mastered
function markGoalMastered() {
    if (!currentGoalSet || currentGoalSet.cards.length === 0) {
        showAlertDialog('No flashcard set selected for goal! Create a set in the Studio.', '');
        return;
    }

    // Increment daily mastered count
    dailyMasteredCount++;

    // Update progress bar
    const progressBar = document.getElementById('dailyProgress');
    const progressText = document.getElementById('dailyProgressText');

    if (progressBar) {
        progressBar.value = Math.min(dailyMasteredCount, 20);
    }
    if (progressText) {
        progressText.textContent = `${Math.min(dailyMasteredCount, 20)}/20 cards`;
    }

    // Show success animation
    const flashcard = document.getElementById('goalFlashcard');
    if (flashcard) {
        flashcard.classList.add('goal-complete-animation');
        setTimeout(() => {
            flashcard.classList.remove('goal-complete-animation');
        }, 500);
    }

    // Show success message
    const masteredCard = currentGoalSet.cards[currentGoalCardIndex];
    showAlertDialog(` Great job!\n\nYou mastered from "${currentGoalSet.name}":\n\n"${masteredCard.question}"\n\nAnswer: ${masteredCard.answer}\n\n+1 point added to your daily goal!`, '');

    // Check if daily goal completed
    if (dailyMasteredCount >= 20) {
        showAlertDialog(' AMAZING! \n\nYou\'ve reached your daily goal of 20 cards!\n\nCome back tomorrow for more learning!', '');
    } else {
        // Move to next card in the set
        nextGoalCard();
    }

    // Update localStorage for persistence
    localStorage.setItem('dailyMasteredCount', dailyMasteredCount);
}

// Skip to next card in the current set
function skipGoalCard() {
    if (!currentGoalSet || currentGoalSet.cards.length === 0) {
        showAlertDialog('No flashcard set selected! Create a set in the Studio.', '');
        return;
    }

    nextGoalCard();
    showToast('️ Skipped to next card in this set', '#ffa500');
}

// Load next card in the set
function nextGoalCard() {
    if (!currentGoalSet || currentGoalSet.cards.length === 0) return;

    currentGoalCardIndex = (currentGoalCardIndex + 1) % currentGoalSet.cards.length;

    // Reset flip state before loading new card
    isGoalFlipped = false;
    const flashcard = document.getElementById('goalFlashcard');
    if (flashcard) {
        flashcard.classList.remove('show-answer');
    }

    loadGoalCard();
}

// Change which set is used for the daily goal
function changeGoalSet(setId) {
    let sets = loadFlashcardSets();
    const newSet = sets.find(s => s.id === setId);

    if (newSet && newSet.cards.length > 0) {
        currentGoalSet = newSet;
        currentGoalCardIndex = 0;
        localStorage.setItem('goalSetId', setId);
        loadGoalCard();
        showAlertDialog(` Goal set changed to "${newSet.name}"!\n\nMaster cards from this set to reach your daily goal!`, '');
    } else if (newSet) {
        showAlertDialog(`"${newSet.name}" has no cards. Add cards first!`, '');
    }
}

// Track last accessed set in localStorage
function updateLastAccessedSet(setId) {
    localStorage.setItem('lastAccessedSetId', setId);
    localStorage.setItem('lastAccessedTimestamp', Date.now());
}

function getLastAccessedSet() {
    const setId = localStorage.getItem('lastAccessedSetId');
    if (!setId) return null;

    let sets = loadFlashcardSets();
    return sets.find(s => s.id === parseInt(setId)) || null;
}

// Load and display ONLY the most recent flashcard set on dashboard
function displayFlashcardSets() {
    const setsContainer = document.getElementById('setsContainer');
    if (!setsContainer) return;

    let sets = loadFlashcardSets();
    let lastSet = getLastAccessedSet();

    if (!lastSet && sets.length > 0) {
        const sortedSets = [...sets].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        lastSet = sortedSets[0];
    }

    if (!lastSet) {
        setsContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;"> No flashcard sets yet. Go to Flashcard Studio to create some!</p>';
        return;
    }

    let html = `
        <div class="set-card recent-set">
            <div class="recent-badge"> MOST RECENT</div>
            <h3> ${escapeHtml(lastSet.name)} <span style="font-size: 12px; background: #667eea; color: white; padding: 2px 8px; border-radius: 12px;">${lastSet.cards.length} cards</span></h3>
            <p>Created: ${lastSet.createdAt}</p>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                <button class="study-btn" onclick="studySet(${lastSet.id})"> Study Now →</button>
                <button class="set-goal-btn" onclick="changeGoalSet(${lastSet.id})"> Set as Daily Goal</button>
            </div>
        </div>
    `;

    if (sets.length > 1) {
        html += `
            <div class="view-all-container">
                <p style="text-align: center; margin-top: 1rem;">
                    <a href="gallery.html" class="view-all-link"> View All ${sets.length} Sets →</a>
                </p>
            </div>
        `;
    }

    setsContainer.innerHTML = html;
}

// Study button function
window.studySet = function(setId) {
    let sets = loadFlashcardSets();
    const set = sets.find(s => s.id === setId);

    if (set && set.cards.length > 0) {
        updateLastAccessedSet(setId);
        sessionStorage.setItem('currentStudySet', JSON.stringify(set));
        window.location.href = `study.html?id=${setId}`;
    } else if (set) {
        showAlertDialog(`"${set.name}" has no cards yet.\n\nAdd some in the Flashcard Studio!`, '');
    }
};

// Initialize dashboard
async function initDashboard() {
    await initPageWithSidebar();

    // Load saved daily progress
    const savedProgress = localStorage.getItem('dailyMasteredCount');
    if (savedProgress) {
        dailyMasteredCount = parseInt(savedProgress);
        const progressBar = document.getElementById('dailyProgress');
        const progressText = document.getElementById('dailyProgressText');
        if (progressBar) progressBar.value = Math.min(dailyMasteredCount, 20);
        if (progressText) progressText.textContent = `${Math.min(dailyMasteredCount, 20)}/20 cards`;
    }

    loadGoalCard();
    displayFlashcardSets();
}

// Make functions global for onclick handlers
window.flipGoalCard = flipGoalCard;
window.markGoalMastered = markGoalMastered;
window.skipGoalCard = skipGoalCard;
window.changeGoalSet = changeGoalSet;

// Run when page loads
if (document.getElementById('setsContainer')) {
    document.addEventListener('DOMContentLoaded', initDashboard);
}

console.log(' dashboard.js loaded - goal from your library');