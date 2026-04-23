// ========== GALLERY FUNCTIONS ==========

let allSets = [];

// Load and display all flashcard sets
function loadGallery() {
    allSets = loadFlashcardSets();

    // Update stats
    updateStats();

    // Display sets
    displayGallerySets(allSets);
}

// Update statistics bar
function updateStats() {
    const totalSetsEl = document.getElementById('totalSets');
    const totalCardsEl = document.getElementById('totalCards');
    const lastStudiedEl = document.getElementById('lastStudied');

    if (totalSetsEl) {
        totalSetsEl.textContent = allSets.length;
    }

    if (totalCardsEl) {
        const totalCards = allSets.reduce((sum, set) => sum + set.cards.length, 0);
        totalCardsEl.textContent = totalCards;
    }

    if (lastStudiedEl) {
        const lastAccessed = localStorage.getItem('lastAccessedTimestamp');
        if (lastAccessed) {
            const date = new Date(parseInt(lastAccessed));
            lastStudiedEl.textContent = date.toLocaleDateString();
        } else {
            lastStudiedEl.textContent = 'Not yet';
        }
    }
}

// Display gallery sets with search filter
function displayGallerySets(sets) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    if (sets.length === 0) {
        galleryGrid.innerHTML = `
            <div class="empty-gallery">
                <h3> No Flashcard Sets Yet</h3>
                <p>Create your first flashcard set to see it here!</p>
                <a href="studio.html" class="create-first-btn"> Create First Set</a>
            </div>
        `;
        return;
    }

    let html = '';
    sets.forEach(set => {
        html += `
            <div class="gallery-card" data-set-id="${set.id}">
                <div class="gallery-card-header">
                    <h3> ${escapeHtml(set.name)}</h3>
                    <span class="card-count-badge">${set.cards.length} cards</span>
                </div>
                <p>Created: ${set.createdAt}</p>
                <div class="card-actions">
                    <button class="gallery-study-btn" onclick="studyFromGallery(${set.id})"> Study Now</button>
                    <button class="gallery-delete-btn" onclick="deleteFromGallery(${set.id})">️ Delete</button>
                </div>
            </div>
        `;
    });
    galleryGrid.innerHTML = html;
}

// Search/filter functionality
function searchSets() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (!searchTerm) {
        displayGallerySets(allSets);
        return;
    }

    const filtered = allSets.filter(set =>
        set.name.toLowerCase().includes(searchTerm)
    );

    displayGallerySets(filtered);
}

// Study from gallery (updates last accessed)
function studyFromGallery(setId) {
    let sets = loadFlashcardSets();
    const set = sets.find(s => s.id === setId);

    if (set && set.cards.length > 0) {
        // Update last accessed
        localStorage.setItem('lastAccessedSetId', setId);
        localStorage.setItem('lastAccessedTimestamp', Date.now());

        sessionStorage.setItem('currentStudySet', JSON.stringify(set));
        window.location.href = `study.html?id=${setId}`;
    } else if (set) {
        showAlertDialog(`"${set.name}" has no cards yet.\n\nAdd some in the Flashcard Studio!`, '');
    }
}

// Delete from gallery with confirmation
function deleteFromGallery(setId) {
    let sets = loadFlashcardSets();
    const deletedSet = sets.find(set => set.id === setId);

    showConfirmDialog(
        `️ Delete entire set "${deletedSet?.name}"?\n\nThis action cannot be undone!`,
        () => {
            sets = sets.filter(set => set.id !== setId);
            saveFlashcardSets(sets);

            // Clear last accessed if it was this set
            const lastAccessedId = localStorage.getItem('lastAccessedSetId');
            if (lastAccessedId && parseInt(lastAccessedId) === setId) {
                localStorage.removeItem('lastAccessedSetId');
                localStorage.removeItem('lastAccessedTimestamp');
            }

            // Reload gallery
            loadGallery();
            showToast(`️ Deleted "${deletedSet.name}"`, '#ff4444');
        }
    );
}

// Initialize gallery
async function initGallery() {
    await initPageWithSidebar();  // Load sidebar first
    loadGallery();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchSets);
    }
}

// Run when on gallery page
if (document.getElementById('galleryGrid')) {
    document.addEventListener('DOMContentLoaded', initGallery);
}

console.log(' gallery.js loaded');