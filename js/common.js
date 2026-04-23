// ========== COMMON / SHARED FUNCTIONS ==========

// Helper function to prevent XSS attacks
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load all flashcard sets from localStorage
function loadFlashcardSets() {
    return JSON.parse(localStorage.getItem('flashcardSets')) || [];
}

// Save flashcard sets to localStorage
function saveFlashcardSets(sets) {
    localStorage.setItem('flashcardSets', JSON.stringify(sets));
}

// Show temporary toast notification
function showToast(message, bgColor = '#4caf50') {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 10px 20px;
        border-radius: 40px;
        font-size: 14px;
        z-index: 9999;
        animation: fadeInOut 1.5s ease;
        white-space: nowrap;
        font-weight: 500;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 1500);
}

// Add toast animation style if not exists
if (!document.querySelector('#toastStyle')) {
    const style = document.createElement('style');
    style.id = 'toastStyle';
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}

// ========== MODAL STYLES (ensure they exist) ==========
function ensureModalStyles() {
    if (!document.querySelector('#modalStyles')) {
        const style = document.createElement('style');
        style.id = 'modalStyles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: modalFadeIn 0.2s ease;
            }

            .modal-content {
                background: white;
                border-radius: 24px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                text-align: center;
                animation: modalSlideUp 0.3s ease;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }

            .modal-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }

            .modal-message {
                font-size: 1.1rem;
                color: #333;
                margin-bottom: 1.5rem;
                line-height: 1.5;
                white-space: pre-line;
            }

            .modal-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }

            .modal-btn {
                padding: 10px 24px;
                border: none;
                border-radius: 40px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
            }

            .modal-btn-cancel {
                background: #e0e0e0;
                color: #333;
            }

            .modal-btn-cancel:hover {
                background: #ccc;
            }

            .modal-btn-confirm {
                background: #ff4444;
                color: white;
            }

            .modal-btn-confirm:hover {
                background: #cc0000;
                transform: scale(1.02);
            }

            .modal-btn-ok {
                background: #667eea;
                color: white;
            }

            .modal-btn-ok:hover {
                background: #5a67d8;
                transform: scale(1.02);
            }

            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes modalSlideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Show simple alert dialog
function showAlertDialog(message, icon = '️') {
    ensureModalStyles();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">${icon}</div>
            <div class="modal-message">${escapeHtml(message)}</div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-ok">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const okBtn = overlay.querySelector('.modal-btn-ok');
    okBtn.addEventListener('click', () => {
        overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// Show confirmation dialog
function showConfirmDialog(message, onConfirm, onCancel = null) {
    ensureModalStyles();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">️</div>
            <div class="modal-message">${escapeHtml(message)}</div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-cancel">Cancel</button>
                <button class="modal-btn modal-btn-confirm">Yes, Confirm</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const cancelBtn = overlay.querySelector('.modal-btn-cancel');
    const confirmBtn = overlay.querySelector('.modal-btn-confirm');

    cancelBtn.addEventListener('click', () => {
        overlay.remove();
        if (onCancel) onCancel();
    });

    confirmBtn.addEventListener('click', () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            if (onCancel) onCancel();
        }
    });
}

// ========== SIDEBAR COMPONENT ==========

// Sidebar HTML as a string
function getSidebarHTML() {
    return `
        <div class="sidebar" id="sidebar">
            <div class="close-btn" id="closeBtn">✕</div>
            <h2> Flashcard Sanctuary</h2>
            <nav>
                <div class="main-menu">
                    <ul>
                        <li><a href="index.html" class="sidebar-link"> Dashboard</a></li>
                    </ul>
                </div>
                <p><strong>Menu</strong></p>
                <ul>
                    <li> Study Focus</li>
                    <li> DEEP WORK MODE</li>
                    <li><a href="gallery.html" class="sidebar-link"> My Library</a></li>
                    <li><a href="studio.html" class="sidebar-link"> Flashcard Studio</a></li>
                    <li> Analytics</li>
                </ul>
            </nav>
        </div>
    `;
}

// Remove old sidebar if exists
function removeOldSidebar() {
    const existingSidebar = document.getElementById('sidebar');
    if (existingSidebar) {
        existingSidebar.remove();
    }
}

// Load and inject sidebar
async function loadSidebar() {
    try {
        removeOldSidebar();

        const sidebarHtml = getSidebarHTML();
        const dashboardContainer = document.querySelector('.dashboard-container');

        if (dashboardContainer) {
            dashboardContainer.insertAdjacentHTML('afterbegin', sidebarHtml);
        } else {
            const hamburger = document.getElementById('hamburger');
            if (hamburger && hamburger.parentNode) {
                const wrapper = document.createElement('div');
                wrapper.className = 'dashboard-container';
                while (hamburger.nextSibling) {
                    wrapper.appendChild(hamburger.nextSibling);
                }
                hamburger.insertAdjacentElement('afterend', wrapper);
                wrapper.insertAdjacentHTML('afterbegin', sidebarHtml);
            }
        }

        initHamburgerMenu();
        console.log(' Sidebar injected successfully');
    } catch (error) {
        console.error('Failed to load sidebar:', error);
    }
}

// Hamburger menu functionality
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
    }

    if (hamburger) {
        hamburger.addEventListener('click', openSidebar);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (sidebar && sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && e.target !== hamburger) {
                    closeSidebar();
                }
            }
        }
    });
}

// Initialize page with sidebar
async function initPageWithSidebar() {
    await loadSidebar();
}

console.log(' common.js loaded with working modals');