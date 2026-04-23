// ========== STUDIO-SPECIFIC FUNCTIONS ==========

let tempCards = []; // Temporary storage for cards being created

// Add card to preview
function addCardToPreview() {
    // Get values from inputs
    const question = document.getElementById('question').value.trim();
    const answer = document.getElementById('answer').value.trim();

    // Validate inputs
    if (!question) {
        alert('❌ Please enter a question!');
        document.getElementById('question').focus();
        return;
    }

    if (!answer) {
        alert('❌ Please enter an answer!');
        document.getElementById('answer').focus();
        return;
    }

    // Add card to temporary array
    tempCards.push({
        question: question,
        answer: answer,
        id: Date.now()
    });

    // Clear inputs
    document.getElementById('question').value = '';
    document.getElementById('answer').value = '';
    document.getElementById('question').focus();

    // Update the preview display
    updatePreview();

    // Show success feedback
    showToast(`✅ Card added! (${tempCards.length} total)`, '#4caf50');
}

// Update preview display
function updatePreview() {
    const previewDiv = document.getElementById('previewCards');
    if (!previewDiv) return;

    if (tempCards.length === 0) {
        previewDiv.innerHTML = '<div class="empty-message">✨ No cards added yet. Add some flashcards above!</div>';
        return;
    }

    let html = '';
    tempCards.forEach((card, index) => {
        html += `
            <div class="card-item">
                <strong>📝 Card ${index + 1}: ${escapeHtml(card.question)}</strong>
                <p><strong>Answer:</strong> ${escapeHtml(card.answer)}</p>
                <button class="delete-card" onclick="removeCard(${index})">✕</button>
            </div>
        `;
    });
    previewDiv.innerHTML = html;
}

// Remove card from preview
function removeCard(index) {
    if (confirm('Remove this card?')) {
        tempCards.splice(index, 1);
        updatePreview();
        showToast(`🗑️ Card removed. ${tempCards.length} cards remaining.`, '#ffa500');
    }
}

// Save flashcard set
function saveFlashcardSet() {
    // Get set name
    const setName = document.getElementById('setName').value.trim();

    // Validate set name
    if (!setName) {
        alert('❌ Please enter a set name!');
        document.getElementById('setName').focus();
        return;
    }

    // Validate cards
    if (tempCards.length === 0) {
        alert('❌ Please add at least one flashcard before saving!');
        return;
    }

    // Get existing sets from localStorage
    let sets = loadFlashcardSets();

    // Check if set name already exists
    const existingSet = sets.find(set => set.name.toLowerCase() === setName.toLowerCase());
    if (existingSet) {
        if (!confirm(`A set named "${setName}" already exists. Do you want to add another one?`)) {
            return;
        }
    }

    // Create new set object
    const newSet = {
        id: Date.now(),
        name: setName,
        cards: [...tempCards], // Copy the cards
        createdAt: new Date().toLocaleDateString(),
        cardCount: tempCards.length
    };

    // Save to localStorage
    sets.push(newSet);
    saveFlashcardSets(sets);

    // Clear the form
    document.getElementById('setName').value = '';
    tempCards = [];
    updatePreview();

    // Refresh the saved sets list
    displaySavedSets();

    // Show success message
    alert(`✅ SUCCESS!\n\nFlashcard set "${setName}" saved!\n📊 ${newSet.cards.length} cards created.\n\nGo to Dashboard to study them!`);

    // Optional: Ask if user wants to add another set
    if (confirm('Would you like to create another flashcard set?')) {
        document.getElementById('setName').focus();
    }
}

// Display saved sets in studio
function displaySavedSets() {
    const savedSetsDiv = document.getElementById('savedSetsList');
    if (!savedSetsDiv) return;

    let sets = loadFlashcardSets();

    if (sets.length === 0) {
        savedSetsDiv.innerHTML = '<div class="empty-message">📭 No flashcard sets yet. Create your first set above!</div>';
        return;
    }

    let html = '';
    sets.forEach(set => {
        html += `
            <div class="set-item">
                <div class="set-info">
                    <strong>📚 ${escapeHtml(set.name)} <span class="card-count">${set.cards.length} cards</span></strong>
                    <p>Created: ${set.createdAt}</p>
                </div>
                <button class="delete-set" onclick="deleteSet(${set.id})">🗑️ Delete Set</button>
            </div>
        `;
    });
    savedSetsDiv.innerHTML = html;
}

// Delete a flashcard set
function deleteSet(setId) {
    if (confirm('⚠️ Are you sure you want to delete this entire flashcard set? This cannot be undone!')) {
        let sets = loadFlashcardSets();
        const deletedSet = sets.find(set => set.id === setId);
        sets = sets.filter(set => set.id !== setId);
        saveFlashcardSets(sets);
        displaySavedSets();

        if (deletedSet) {
            showToast(`🗑️ Deleted "${deletedSet.name}"`, '#ff4444');
        }
    }
}

// Initialize studio page
function initStudio() {
    displaySavedSets();
    initHamburgerMenu();

    // Add enter key support for adding cards
    const questionInput = document.getElementById('question');
    const answerInput = document.getElementById('answer');

    if (questionInput) {
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && answerInput.value.trim()) {
                addCardToPreview();
            }
        });
    }

    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && document.getElementById('question').value.trim()) {
                addCardToPreview();
            }
        });
    }
}

// Run when on studio page
if (document.getElementById('savedSetsList')) {
    document.addEventListener('DOMContentLoaded', initStudio);
}

console.log('✅ studio.js loaded');