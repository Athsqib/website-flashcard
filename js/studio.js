// ========== STUDIO-SPECIFIC FUNCTIONS ==========

let tempCards = [];

// Add card to preview
function addCardToPreview() {
    const question = document.getElementById('question').value.trim();
    const answer = document.getElementById('answer').value.trim();

    if (!question) {
        showAlertDialog('Please enter a question!', '');
        document.getElementById('question').focus();
        return;
    }

    if (!answer) {
        showAlertDialog('Please enter an answer!', '');
        document.getElementById('answer').focus();
        return;
    }

    tempCards.push({
        question: question,
        answer: answer,
        id: Date.now()
    });

    document.getElementById('question').value = '';
    document.getElementById('answer').value = '';
    document.getElementById('question').focus();

    updatePreview();
    showToast(` Card added! (${tempCards.length} total)`, '#4caf50');
}

// Remove card from preview (WITH CONFIRMATION)
function removeCard(index) {
    showConfirmDialog(
        `Remove this card?\n\n"${tempCards[index].question}"`,
        () => {
            tempCards.splice(index, 1);
            updatePreview();
            showToast(`️ Card removed. ${tempCards.length} cards remaining.`, '#ffa500');
        }
    );
}

// Save flashcard set (WITH VALIDATION ALERTS)
function saveFlashcardSet() {
    const setName = document.getElementById('setName').value.trim();

    if (!setName) {
        showAlertDialog('Please enter a set name!', '');
        document.getElementById('setName').focus();
        return;
    }

    if (tempCards.length === 0) {
        showAlertDialog('Please add at least one flashcard before saving!', '');
        return;
    }

    let sets = loadFlashcardSets();
    const existingSet = sets.find(set => set.name.toLowerCase() === setName.toLowerCase());

    if (existingSet) {
        showConfirmDialog(
            `A set named "${setName}" already exists.\n\nDo you want to add another one anyway?`,
            () => {
                saveSet(setName, sets);
            }
        );
    } else {
        saveSet(setName, sets);
    }
}

function saveSet(setName, sets) {
    const newSet = {
        id: Date.now(),
        name: setName,
        cards: [...tempCards],
        createdAt: new Date().toLocaleDateString(),
        cardCount: tempCards.length
    };

    sets.push(newSet);
    saveFlashcardSets(sets);

    document.getElementById('setName').value = '';
    tempCards = [];
    updatePreview();
    displaySavedSets();

    showAlertDialog(
        ` SUCCESS!\n\nFlashcard set "${setName}" saved!\n ${newSet.cards.length} cards created.\n\nGo to Dashboard to study them!`,
        ''
    );

    setTimeout(() => {
        if (confirm('Would you like to create another flashcard set?')) {
            document.getElementById('setName').focus();
        }
    }, 500);
}

// Delete a flashcard set (WITH CONFIRMATION)
function deleteSet(setId) {
    let sets = loadFlashcardSets();
    const deletedSet = sets.find(set => set.id === setId);

    showConfirmDialog(
        `️ Delete entire set "${deletedSet?.name}"?\n\nThis action cannot be undone!`,
        () => {
            sets = sets.filter(set => set.id !== setId);
            saveFlashcardSets(sets);
            displaySavedSets();
            showToast(`️ Deleted "${deletedSet.name}"`, '#ff4444');
        }
    );
}

// Display saved sets in studio
function displaySavedSets() {
    const savedSetsDiv = document.getElementById('savedSetsList');
    if (!savedSetsDiv) return;

    let sets = loadFlashcardSets();

    if (sets.length === 0) {
        savedSetsDiv.innerHTML = '<div class="empty-message"> No flashcard sets yet. Create your first set above!</div>';
        return;
    }

    let html = '';
    sets.forEach(set => {
        html += `
            <div class="set-item">
                <div class="set-info">
                    <strong> ${escapeHtml(set.name)} <span class="card-count">${set.cards.length} cards</span></strong>
                    <p>Created: ${set.createdAt}</p>
                </div>
                <button class="delete-set" onclick="deleteSet(${set.id})">️ Delete Set</button>
            </div>
        `;
    });
    savedSetsDiv.innerHTML = html;
}

// Initialize studio page
async function initStudio() {
    await initPageWithSidebar();  // Load sidebar first
    displaySavedSets();

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

if (document.getElementById('savedSetsList')) {
    document.addEventListener('DOMContentLoaded', initStudio);
}

console.log(' studio.js updated with confirmation popups');