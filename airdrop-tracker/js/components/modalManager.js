// Modal Management
const ModalManager = {
    init() {
        this.bindModalEvents();
    },

    bindModalEvents() {
        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Form submissions
        document.getElementById('addAirdropForm').addEventListener('submit', (e) => this.handleAddAirdrop(e));
        document.getElementById('editAirdropForm').addEventListener('submit', (e) => this.handleEditAirdrop(e));
        document.getElementById('addTaskForm').addEventListener('submit', (e) => this.handleAddTask(e));

        // Task recurrence change
        document.querySelector('select[name="taskRecurrence"]').addEventListener('change', (e) => {
            this.toggleCustomTimer(e.target.value);
        });
    },

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    },

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    },

    // Add Airdrop
    handleAddAirdrop(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const airdrop = {
            project: formData.get('projectName'),
            chain: formData.get('chain'),
            category: formData.get('category'),
            status: formData.get('status'),
            progress: 0,
            tasks: { completed: 0, total: 0 },
            projectStart: formData.get('projectStart'),
            dateStarted: formData.get('dateStarted'),
            lastChecked: new Date().toISOString().split('T')[0],
            urgency: CONSTANTS.URGENCY.MEDIUM,
            socials: [],
            socialUrls: {},
            tasksList: [],
            notes: ''
        };

        AirdropData.addAirdrop(airdrop);
        App.renderTable();
        this.closeModals();
        e.target.reset();
    },

    // Edit Airdrop
    showEditModal(airdrop) {
        document.getElementById('editId').value = airdrop.id;
        document.getElementById('editProjectName').value = airdrop.project;
        document.getElementById('editChain').value = airdrop.chain || '';
        document.getElementById('editCategory').value = airdrop.category || '';
        document.getElementById('editStatus').value = airdrop.status;
        document.getElementById('editProjectStart').value = airdrop.projectStart;
        document.getElementById('editDateStarted').value = airdrop.dateStarted || '';
        document.getElementById('editUrgency').value = airdrop.urgency;
        
        // Populate social links
        this.populateSocialLinks(airdrop);
        
        this.showModal('editAirdropModal');
    },

    populateSocialLinks(airdrop) {
        const socialsContainer = document.getElementById('editSocialLinks');
        socialsContainer.innerHTML = '';
        
        airdrop.socials.forEach((social, index) => {
            const socialGroup = document.createElement('div');
            socialGroup.className = 'social-input-group';
            socialGroup.innerHTML = `
                <select class="social-platform" onchange="App.updateSocialPlatform('${airdrop.id}', ${index}, this.value)">
                    <option value="twitter" ${social === 'twitter' ? 'selected' : ''}>Twitter</option>
                    <option value="discord" ${social === 'discord' ? 'selected' : ''}>Discord</option>
                    <option value="website" ${social === 'website' ? 'selected' : ''}>Website</option>
                    <option value="telegram" ${social === 'telegram' ? 'selected' : ''}>Telegram</option>
                    <option value="medium" ${social === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="github" ${social === 'github' ? 'selected' : ''}>GitHub</option>
                </select>
                <input type="text" class="social-url" placeholder="Enter URL" 
                       value="${airdrop.socialUrls && airdrop.socialUrls[social] ? airdrop.socialUrls[social] : ''}" 
                       onchange="App.updateSocialUrl('${airdrop.id}', '${social}', this.value)">
                <button type="button" class="action-btn" onclick="App.removeSocialLink('${airdrop.id}', ${index})" title="Remove" style="color: var(--warning);">
                    <i class="fas fa-times"></i>
                </button>
            `;
            socialsContainer.appendChild(socialGroup);
        });
        
        // Add button to add new social link
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'btn btn-small';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add Social Link';
        addButton.onclick = () => App.addSocialLink(airdrop.id);
        socialsContainer.appendChild(addButton);
    },

    handleEditAirdrop(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updates = {
            project: formData.get('editProjectName'),
            chain: formData.get('editChain'),
            category: formData.get('editCategory'),
            status: formData.get('editStatus'),
            urgency: formData.get('editUrgency'),
            projectStart: formData.get('editProjectStart'),
            dateStarted: formData.get('editDateStarted'),
            lastChecked: new Date().toISOString().split('T')[0]
        };

        AirdropData.updateAirdrop(formData.get('editId'), updates);
        App.renderTable();
        this.closeModals();
    },

    // Add Task
    showAddTaskModal(airdropId) {
        document.getElementById('taskAirdropId').value = airdropId;
        this.showModal('addTaskModal');
    },

    handleAddTask(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const airdropId = formData.get('airdropId');
        const taskName = formData.get('taskName');
        const recurrence = formData.get('taskRecurrence');
        
        const task = {
            id: Helpers.generateId(),
            name: taskName,
            completed: false,
            recurrence: recurrence
        };

        // Add timer for recurring tasks
        if (recurrence !== 'one-time') {
            if (recurrence === 'custom') {
                const customHours = parseInt(formData.get('customTimer')) || 24;
                task.timer = `${customHours.toString().padStart(2, '0')}:00:00`;
            } else {
                task.timer = recurrence === '24h' ? '23:59:59' : '23:59:59';
            }
        }

        const airdrop = AirdropData.airdrops.find(a => a.id === airdropId);
        if (airdrop) {
            airdrop.tasksList.push(task);
            airdrop.tasks.total++;
            airdrop.progress = Math.round((airdrop.tasks.completed / airdrop.tasks.total) * 100);
            AirdropData.saveToStorage();
            App.renderTable();
        }

        this.closeModals();
        e.target.reset();
        document.getElementById('customTimerGroup').style.display = 'none';
    },

    toggleCustomTimer(recurrence) {
        const customTimerGroup = document.getElementById('customTimerGroup');
        customTimerGroup.style.display = recurrence === 'custom' ? 'block' : 'none';
    }
};