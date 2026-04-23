// ========== DASHBOARD-SPECIFIC FUNCTIONS ==========

// Load and display flashcard sets on dashboard
function displayFlashcardSets() {
    const setsContainer = document.getElementById('setsContainer');
    if (!setsContainer) return;

    let sets = loadFlashcardSets();

    if (sets.length === 0) {
        setsContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">📭 No flashcard sets yet. Go to Flashcard Studio to create some!</p>';
        return;
    }

    let html = '';
    sets.forEach(set => {
        html += `
            <div class="set-card">
                <h3>📚 ${escapeHtml(set.name)} <span style="font-size: 12px; background: #667eea; color: white; padding: 2px 8px; border-radius: 12px;">${set.cards.length} cards</span></h3>
                <p>Created: ${set.createdAt}</p>
                <button class="study-btn" onclick="studySet(${set.id})">📖 Study Now →</button>
            </div>
        `;
    });
    setsContainer.innerHTML = html;
}

// Study button function
window.studySet = function(setId) {
    let sets = loadFlashcardSets();
    const set = sets.find(s => s.id === setId);

    if (set && set.cards.length > 0) {
        // Store the set in sessionStorage
        sessionStorage.setItem('currentStudySet', JSON.stringify(set));
        // Redirect to study page
        window.location.href = `study.html?id=${setId}`;
    } else if (set) {
        alert(`"${set.name}" has no cards yet. Add some in the Flashcard Studio!`);
    }
};

// Continue button on dashboard
function initDashboardButtons() {
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            alert('🇪🇸 Continuing Spanish Vocabulary — 85% complete!\n\nKeep going! You got this! 💪');
        });
    }
}

// Initialize dashboard
function initDashboard() {
    displayFlashcardSets();
    initDashboardButtons();
    initHamburgerMenu();
}

// Run when page loads
if (document.getElementById('setsContainer')) {
    document.addEventListener('DOMContentLoaded', initDashboard);
}

console.log('✅ dashboard.js loaded');