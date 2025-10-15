// UI Components
const TableRenderer = {
    renderTable(airdrops) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        airdrops.forEach(airdrop => {
            tbody.appendChild(this.createTableRow(airdrop));
            tbody.appendChild(this.createDetailsRow(airdrop));
        });
    },

    createTableRow(airdrop) {
        const row = document.createElement('tr');
        row.className = 'table-row';
        row.setAttribute('data-id', airdrop.id);
        
        row.innerHTML = `
            <td>
                <div class="project-cell">
                    <div class="project-icon">${airdrop.project.substring(0, 2)}</div>
                    <div class="project-name">${airdrop.project}</div>
                </div>
            </td>
            <td>${airdrop.chain || 'Not set'}</td>
            <td>${airdrop.category || 'Not set'}</td>
            <td><span class="status-badge status-${airdrop.status}">${Helpers.capitalize(airdrop.status)}</span></td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${airdrop.progress}%"></div>
                </div>
                <div class="progress-text">${airdrop.progress}% Complete</div>
            </td>
            <td>${airdrop.tasks.completed}/${airdrop.tasks.total}</td>
            <td>${Helpers.formatDate(airdrop.projectStart)}</td>
            <td>${Helpers.formatDate(airdrop.dateStarted)}</td>
            <td>${Helpers.formatDate(airdrop.lastChecked) || 'Never'}</td>
            <td class="urgency-${airdrop.urgency}">${Helpers.capitalize(airdrop.urgency)}</td>
            <td>
                <div class="social-links">
                    ${airdrop.socials.map((social, index) => {
                        const socialIcons = {
                            'twitter': 'fab fa-twitter',
                            'discord': 'fab fa-discord', 
                            'website': 'fas fa-globe',
                            'telegram': 'fab fa-telegram',
                            'medium': 'fab fa-medium',
                            'github': 'fab fa-github'
                        };
                        const iconClass = socialIcons[social] || 'fas fa-link';
                        const url = airdrop.socialUrls && airdrop.socialUrls[social] ? airdrop.socialUrls[social] : '#';
                        return `<a href="${url}" class="social-link" title="${social}" target="_blank" onclick="event.stopPropagation()"><i class="${iconClass}"></i></a>`;
                    }).join('')}
                </div>
            </td>
            <td>
                <div class="actions-cell">
                    <button class="action-btn" onclick="event.stopPropagation(); App.editAirdrop('${airdrop.id}')" title="Edit Airdrop">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); App.deleteAirdrop('${airdrop.id}')" title="Delete Airdrop" style="color: var(--warning);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    },

    createDetailsRow(airdrop) {
        const row = document.createElement('tr');
        row.className = 'row-details';
        row.setAttribute('data-id', airdrop.id);
        
        row.innerHTML = `
            <td colspan="13">
                <div class="details-content">
                    <div>
                        <div class="details-section">
                            <div class="details-title">Project Information</div>
                            <div><strong>Chain:</strong> ${airdrop.chain || 'Not set'}</div>
                            <div><strong>Category:</strong> ${airdrop.category || 'Not set'}</div>
                            <div><strong>Total Tasks:</strong> ${airdrop.tasks.total}</div>
                            <div><strong>Completed Tasks:</strong> ${airdrop.tasks.completed}</div>
                            <div><strong>Progress:</strong> ${airdrop.progress}%</div>
                            <div><strong>Last Checked:</strong> ${Helpers.formatDate(airdrop.lastChecked) || 'Never'}</div>
                        </div>
                        <div class="details-section">
                            <div class="details-title">Notes</div>
                            <textarea class="notes-textarea" placeholder="Add notes about this project..." onchange="App.updateNotes('${airdrop.id}', this.value)" onclick="event.stopPropagation()">${airdrop.notes || ''}</textarea>
                        </div>
                    </div>
                    <div>
                        <div class="details-section">
                            <div class="details-title">Tasks</div>
                            <div class="task-list">
                                ${airdrop.tasksList.map(task => `
                                    <div class="task-row">
                                        <div class="task-info">
                                            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                                                   onchange="App.toggleTask('${airdrop.id}', '${task.id}')" onclick="event.stopPropagation()">
                                            <span class="${task.completed ? 'completed-task' : ''}">${task.name}</span>
                                            <span class="task-recurrence-badge recurrence-${task.recurrence}">${task.recurrence}</span>
                                            ${task.timer ? `<span class="task-timer">${task.timer}</span>` : ''}
                                        </div>
                                        <div class="task-actions">
                                            <button class="action-btn" title="Delete Task" onclick="event.stopPropagation(); App.deleteTask('${airdrop.id}', '${task.id}')" style="color: var(--warning);">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                                ${airdrop.tasksList.length === 0 ? `
                                    <div class="no-tasks">
                                        <p>No tasks yet. <button class="btn-text" onclick="event.stopPropagation(); App.addTask('${airdrop.id}')">Add your first task</button></p>
                                    </div>
                                ` : ''}
                                <div class="add-task-section">
                                    <button class="btn btn-small" onclick="event.stopPropagation(); App.addTask('${airdrop.id}')">
                                        <i class="fas fa-plus"></i> Add New Task
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        `;

        return row;
    }
};