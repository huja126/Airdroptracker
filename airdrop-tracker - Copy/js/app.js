// Main Application
const App = {
    currentSort: { column: null, direction: 'asc' },
    visibleColumns: {},
    openRowId: null, // Track currently open row

    init() {
        this.loadVisibleColumns();
        this.bindEvents();
        this.renderTable();
        this.loadPreferences();
        ModalManager.init();
    },

    loadVisibleColumns() {
        const stored = localStorage.getItem(CONSTANTS.STORAGE_KEYS.VISIBLE_COLUMNS);
        this.visibleColumns = stored ? JSON.parse(stored) : {
            [CONSTANTS.COLUMNS.PROJECT]: true,
            [CONSTANTS.COLUMNS.CHAIN]: true,
            [CONSTANTS.COLUMNS.CATEGORY]: true,
            [CONSTANTS.COLUMNS.STATUS]: true,
            [CONSTANTS.COLUMNS.PROGRESS]: true,
            [CONSTANTS.COLUMNS.TASKS]: true,
            [CONSTANTS.COLUMNS.PROJECT_START]: true,
            [CONSTANTS.COLUMNS.DATE_STARTED]: true,
            [CONSTANTS.COLUMNS.LAST_CHECKED]: true,
            [CONSTANTS.COLUMNS.URGENCY]: true,
            [CONSTANTS.COLUMNS.SOCIALS]: true,
            [CONSTANTS.COLUMNS.ACTIONS]: true
        };
        this.applyColumnVisibility();
    },

    saveVisibleColumns() {
        localStorage.setItem(CONSTANTS.STORAGE_KEYS.VISIBLE_COLUMNS, JSON.stringify(this.visibleColumns));
    },

    applyColumnVisibility() {
        const headers = document.querySelectorAll('.airdrop-table th');
        headers.forEach((header, index) => {
            const columnKey = Object.keys(CONSTANTS.COLUMNS)[index];
            const isVisible = this.visibleColumns[CONSTANTS.COLUMNS[columnKey]];
            header.style.display = isVisible ? '' : 'none';
            
            // Hide corresponding cells in all rows
            document.querySelectorAll('.airdrop-table tr').forEach(row => {
                const cell = row.children[index];
                if (cell) {
                    cell.style.display = isVisible ? '' : 'none';
                }
            });
        });
    },

    bindEvents() {
        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', this.toggleDarkMode);

        // Modal controls
        document.getElementById('addAirdropBtn').addEventListener('click', () => ModalManager.showModal('addAirdropModal'));

        // Columns control - prevent dropdown close when clicking checkboxes
        document.getElementById('columnsToggle').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('columnsDropdown').classList.toggle('active');
        });

        // Column checkboxes - prevent event propagation
        document.querySelectorAll('.column-option input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation(); // Prevent dropdown close
                const column = e.target.value;
                this.visibleColumns[column] = e.target.checked;
                this.saveVisibleColumns();
                this.applyColumnVisibility();
                // Keep dropdown open
                document.getElementById('columnsDropdown').classList.add('active');
            });

            // Set initial checkbox states
            const column = checkbox.value;
            checkbox.checked = this.visibleColumns[column] !== false;
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.columns-control')) {
                document.getElementById('columnsDropdown').classList.remove('active');
            }
        });

        // Filters and search
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('urgencyFilter').addEventListener('change', () => this.applyFilters());
        
        const debouncedSearch = Helpers.debounce(() => this.applyFilters(), 300);
        document.getElementById('searchInput').addEventListener('input', debouncedSearch);

        // Table sorting
        document.querySelectorAll('.airdrop-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => this.sortTable(th.dataset.sort));
        });

        // Row click events - Add this for row click functionality
        this.bindRowClickEvents();

        // Timer updates
        setInterval(() => this.updateTimers(), 1000);

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                ModalManager.closeModals();
            }
        });
    },

    // Add this method to bind row click events
    bindRowClickEvents() {
        // Use event delegation for dynamic content
        document.getElementById('tableBody').addEventListener('click', (e) => {
            const tableRow = e.target.closest('.table-row');
            if (tableRow && !e.target.closest('.actions-cell') && !e.target.closest('.social-link')) {
                this.toggleRowDetails(tableRow);
            }
        });
    },

    renderTable() {
        let airdrops = AirdropData.airdrops;
        
        // Apply current sort
        if (this.currentSort.column) {
            airdrops = Helpers.sortAirdrops(airdrops, this.currentSort.column, this.currentSort.direction);
        }
        
        TableRenderer.renderTable(airdrops);
        this.applyColumnVisibility();
        
        // Re-open the previously open row if it still exists
        if (this.openRowId) {
            const row = document.querySelector(`.table-row[data-id="${this.openRowId}"]`);
            if (row) {
                this.toggleRowDetails(row, true); // Force open
            }
        }
    },

    applyFilters() {
        const filters = {
            status: document.getElementById('statusFilter').value,
            urgency: document.getElementById('urgencyFilter').value,
            search: document.getElementById('searchInput').value
        };

        const filteredAirdrops = AirdropData.getFilteredAirdrops(filters);
        
        // Apply sort to filtered results
        let sortedAirdrops = filteredAirdrops;
        if (this.currentSort.column) {
            sortedAirdrops = Helpers.sortAirdrops(filteredAirdrops, this.currentSort.column, this.currentSort.direction);
        }
        
        TableRenderer.renderTable(sortedAirdrops);
        this.applyColumnVisibility();
    },

    sortTable(column) {
        if (this.currentSort.column === column) {
            // Toggle direction if same column
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // New column, default to ascending
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        // Update sort icons
        document.querySelectorAll('.airdrop-table th i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        const currentHeader = document.querySelector(`.airdrop-table th[data-sort="${column}"]`);
        if (currentHeader) {
            const icon = currentHeader.querySelector('i');
            icon.className = this.currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }

        this.renderTable();
    },

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem(CONSTANTS.STORAGE_KEYS.DARK_MODE, document.body.classList.contains('dark-mode'));
    },

    loadPreferences() {
        if (localStorage.getItem(CONSTANTS.STORAGE_KEYS.DARK_MODE) === 'true') {
            document.body.classList.add('dark-mode');
        }
    },

    toggleRowDetails(row, forceOpen = false) {
        const rowId = row.dataset.id;
        const detailsRow = document.querySelector(`.row-details[data-id="${rowId}"]`);
        
        // Update last checked timestamp
        this.updateLastChecked(rowId);
        
        // If we're not forcing open and clicking the same row, toggle it
        if (!forceOpen && this.openRowId === rowId) {
            detailsRow.classList.remove('active');
            this.openRowId = null;
            return;
        }
        
        // Close all other details
        document.querySelectorAll('.row-details.active').forEach(openRow => {
            openRow.classList.remove('active');
        });
        
        // Open current row
        if (detailsRow) {
            detailsRow.classList.add('active');
            this.openRowId = rowId;
        }
    },

    updateLastChecked(airdropId) {
        const airdrop = AirdropData.airdrops.find(a => a.id === airdropId);
        if (airdrop) {
            airdrop.lastChecked = new Date().toISOString().split('T')[0];
            AirdropData.saveToStorage();
        }
    },

    editAirdrop(id) {
        const airdrop = AirdropData.airdrops.find(a => a.id === id);
        if (airdrop) {
            ModalManager.showEditModal(airdrop);
        }
    },

    deleteAirdrop(id) {
        if (confirm('Are you sure you want to delete this airdrop?')) {
            AirdropData.deleteAirdrop(id);
            if (this.openRowId === id) {
                this.openRowId = null;
            }
            this.renderTable();
        }
    },

    addTask(airdropId) {
        ModalManager.showAddTaskModal(airdropId);
    },

    toggleTask(airdropId, taskId) {
        // Store current open state
        const wasOpen = this.openRowId === airdropId;
        
        AirdropData.toggleTask(airdropId, taskId);
        
        // Re-render while maintaining open state
        this.renderTable();
        
        // Re-open the row if it was open
        if (wasOpen) {
            this.openRowId = airdropId;
            const detailsRow = document.querySelector(`.row-details[data-id="${airdropId}"]`);
            if (detailsRow) {
                detailsRow.classList.add('active');
            }
        }
    },

    deleteTask(airdropId, taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            // Store current open state
            const wasOpen = this.openRowId === airdropId;
            
            AirdropData.deleteTask(airdropId, taskId);
            
            // Re-render while maintaining open state
            this.renderTable();
            
            // Re-open the row if it was open
            if (wasOpen) {
                this.openRowId = airdropId;
                const detailsRow = document.querySelector(`.row-details[data-id="${airdropId}"]`);
                if (detailsRow) {
                    detailsRow.classList.add('active');
                }
            }
        }
    },

    // Notes management
    updateNotes(airdropId, notes) {
        AirdropData.updateAirdrop(airdropId, { notes: notes });
    },

    updateTimers() {
        document.querySelectorAll('.task-timer').forEach(timer => {
            let time = timer.textContent;
            let parts = time.split(':');
            let hours = parseInt(parts[0]);
            let minutes = parseInt(parts[1]);
            let seconds = parseInt(parts[2]);
            
            seconds--;
            if (seconds < 0) {
                seconds = 59;
                minutes--;
                if (minutes < 0) {
                    minutes = 59;
                    hours--;
                    if (hours < 0) {
                        // Timer expired - reset based on task type
                        hours = 23;
                        minutes = 59;
                        seconds = 59;
                    }
                }
            }
            
            timer.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});