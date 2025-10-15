// Data Layer - Separate data from presentation
const AirdropData = {
    airdrops: [],

    init() {
        this.loadFromStorage();
        if (this.airdrops.length === 0) {
            this.loadSampleData();
        }
    },

    loadSampleData() {
        this.airdrops = [
            {
                id: this.generateId(),
                project: 'StarkNet',
                chain: 'StarkNet',
                category: 'Infrastructure',
                status: CONSTANTS.STATUS.ACTIVE,
                progress: 67,
                tasks: { completed: 8, total: 12 },
                projectStart: '2023-03-15',
                dateStarted: '2023-03-20',
                lastChecked: '2024-01-15',
                urgency: CONSTANTS.URGENCY.HIGH,
                socials: ['twitter', 'discord', 'website'],
                socialUrls: {
                    'twitter': 'https://twitter.com/starknet',
                    'discord': 'https://discord.gg/starknet',
                    'website': 'https://starknet.io'
                },
                tasksList: [
                    { id: this.generateId(), name: 'Complete onboarding quests', completed: false, recurrence: CONSTANTS.RECURRENCE.ONE_TIME },
                    { id: this.generateId(), name: 'Bridge ETH to StarkNet', completed: true, recurrence: CONSTANTS.RECURRENCE.ONE_TIME },
                    { id: this.generateId(), name: 'Make a transaction', completed: false, recurrence: CONSTANTS.RECURRENCE.HOURLY_24, timer: '23:14:32' }
                ],
                notes: 'Important: Complete all quests before mainnet launch.'
            },
            {
                id: this.generateId(),
                project: 'LayerZero',
                chain: 'Ethereum',
                category: 'Bridge',
                status: CONSTANTS.STATUS.ACTIVE,
                progress: 56,
                tasks: { completed: 5, total: 9 },
                projectStart: '2023-04-01',
                dateStarted: '2023-04-05',
                lastChecked: '2024-01-14',
                urgency: CONSTANTS.URGENCY.MEDIUM,
                socials: ['twitter', 'discord', 'website'],
                socialUrls: {
                    'twitter': 'https://twitter.com/layerzero_labs',
                    'discord': 'https://discord.gg/layerzero',
                    'website': 'https://layerzero.network'
                },
                tasksList: [
                    { id: this.generateId(), name: 'Bridge tokens across chains', completed: true, recurrence: CONSTANTS.RECURRENCE.ONE_TIME },
                    { id: this.generateId(), name: 'Daily transaction', completed: false, recurrence: CONSTANTS.RECURRENCE.DAILY, timer: '14:32:18' }
                ],
                notes: 'Focus on bridging between different chains for maximum points.'
            },
            {
                id: this.generateId(),
                project: 'zkSync',
                chain: 'zkSync',
                category: 'Infrastructure',
                status: CONSTANTS.STATUS.UPCOMING,
                progress: 0,
                tasks: { completed: 0, total: 7 },
                projectStart: '2023-08-01',
                dateStarted: null,
                lastChecked: null,
                urgency: CONSTANTS.URGENCY.LOW,
                socials: ['twitter', 'discord', 'website'],
                socialUrls: {
                    'twitter': 'https://twitter.com/zksync',
                    'discord': 'https://discord.gg/zksync',
                    'website': 'https://zksync.io'
                },
                tasksList: [
                    { id: this.generateId(), name: 'Bridge to zkSync Era', completed: false, recurrence: CONSTANTS.RECURRENCE.ONE_TIME },
                    { id: this.generateId(), name: 'Swap tokens on SyncSwap', completed: false, recurrence: CONSTANTS.RECURRENCE.ONE_TIME }
                ],
                notes: 'Waiting for official airdrop announcement.'
            }
        ];
        this.saveToStorage();
    },

    // Data manipulation methods
    addAirdrop(airdrop) {
        airdrop.id = this.generateId();
        // Initialize socialUrls if not provided
        if (!airdrop.socialUrls) {
            airdrop.socialUrls = {};
        }
        if (!airdrop.lastChecked) {
            airdrop.lastChecked = new Date().toISOString().split('T')[0];
        }
        this.airdrops.push(airdrop);
        this.saveToStorage();
        return airdrop;
    },

    updateAirdrop(id, updates) {
        const index = this.airdrops.findIndex(a => a.id === id);
        if (index !== -1) {
            this.airdrops[index] = { ...this.airdrops[index], ...updates };
            this.saveToStorage();
            return this.airdrops[index];
        }
        return null;
    },

    deleteAirdrop(id) {
        const index = this.airdrops.findIndex(a => a.id === id);
        if (index !== -1) {
            const deleted = this.airdrops.splice(index, 1)[0];
            this.saveToStorage();
            return deleted;
        }
        return null;
    },

    // Social links management
    updateSocialPlatform(airdropId, index, newPlatform) {
        const airdrop = this.airdrops.find(a => a.id === airdropId);
        if (airdrop) {
            const oldPlatform = airdrop.socials[index];
            // Move URL if it exists
            if (airdrop.socialUrls && airdrop.socialUrls[oldPlatform]) {
                airdrop.socialUrls[newPlatform] = airdrop.socialUrls[oldPlatform];
                delete airdrop.socialUrls[oldPlatform];
            }
            airdrop.socials[index] = newPlatform;
            this.saveToStorage();
        }
    },

    updateSocialUrl(airdropId, platform, url) {
        const airdrop = this.airdrops.find(a => a.id === airdropId);
        if (airdrop) {
            if (!airdrop.socialUrls) {
                airdrop.socialUrls = {};
            }
            airdrop.socialUrls[platform] = url;
            this.saveToStorage();
        }
    },

    addSocialLink(airdropId) {
        const airdrop = this.airdrops.find(a => a.id === airdropId);
        if (airdrop) {
            airdrop.socials.push('twitter');
            if (!airdrop.socialUrls) {
                airdrop.socialUrls = {};
            }
            airdrop.socialUrls['twitter'] = '';
            this.saveToStorage();
        }
    },

    removeSocialLink(airdropId, index) {
        const airdrop = this.airdrops.find(a => a.id === airdropId);
        if (airdrop && airdrop.socials.length > index) {
            const platform = airdrop.socials[index];
            airdrop.socials.splice(index, 1);
            if (airdrop.socialUrls && airdrop.socialUrls[platform]) {
                delete airdrop.socialUrls[platform];
            }
            this.saveToStorage();
        }
    },

    // Task management
    addTask(airdropId, task) {
        const airdrop = this.airdrops.find(a => a.id === airdropId);
        if (airdrop) {
            task.id = this.generateId();
            airdrop.tasksList.push(task);
            airdrop.tasks.total++;
            airdrop.progress = Math.round((airdrop.tasks.completed / airdrop.tasks.total) * 100);
            this.saveToStorage();
            return task;
        }
        return null;
    },

    deleteTask(airdropId, taskId) {
        const airdrop = this.airdrops.find(a => a.id === airdropId);
        if (airdrop) {
            const taskIndex = airdrop.tasksList.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                const task = airdrop.tasksList[taskIndex];
                airdrop.tasksList.splice(taskIndex, 1);
                airdrop.tasks.total--;
                if (task.completed) {
                    airdrop.tasks.completed--;
                }
                airdrop.progress = airdrop.tasks.total > 0 ? Math.round((airdrop.tasks.completed / airdrop.tasks.total) * 100) : 0;
                this.saveToStorage();
                return task;
            }
        }
        return null;
    },

    toggleTask(airdropId, taskId) {
        const airdrop = this.airdrops.find(a => a.id === airdropId);
        if (airdrop) {
            const task = airdrop.tasksList.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                airdrop.tasks.completed += task.completed ? 1 : -1;
                airdrop.progress = Math.round((airdrop.tasks.completed / airdrop.tasks.total) * 100);
                this.saveToStorage();
                return task;
            }
        }
        return null;
    },

    getFilteredAirdrops(filters = {}) {
        return this.airdrops.filter(airdrop => {
            if (filters.status && filters.status !== 'all' && airdrop.status !== filters.status) return false;
            if (filters.urgency && filters.urgency !== 'all' && airdrop.urgency !== filters.urgency) return false;
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                if (!airdrop.project.toLowerCase().includes(searchTerm) && 
                    !(airdrop.chain && airdrop.chain.toLowerCase().includes(searchTerm)) &&
                    !(airdrop.category && airdrop.category.toLowerCase().includes(searchTerm))) {
                    return false;
                }
            }
            return true;
        });
    },

    // Storage methods
    saveToStorage() {
        localStorage.setItem(CONSTANTS.STORAGE_KEYS.AIRDROP_DATA, JSON.stringify(this.airdrops));
    },

    loadFromStorage() {
        const stored = localStorage.getItem(CONSTANTS.STORAGE_KEYS.AIRDROP_DATA);
        if (stored) {
            this.airdrops = JSON.parse(stored);
        }
    },

    generateId() {
        return Helpers.generateId();
    }
};

// Initialize data
AirdropData.init();