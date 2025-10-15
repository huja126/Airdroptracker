// Utility Functions
const Helpers = {
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    formatDate(dateString) {
        if (!dateString) return 'Not Started';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    getColorForPotential(potential) {
        const colors = {
            [CONSTANTS.POTENTIAL.HIGH]: 'success',
            [CONSTANTS.POTENTIAL.MEDIUM]: 'primary',
            [CONSTANTS.POTENTIAL.LOW]: 'warning'
        };
        return colors[potential] || 'gray';
    },

    // Sorting functions
    sortAirdrops(airdrops, column, direction) {
        return [...airdrops].sort((a, b) => {
            let aValue, bValue;

            switch (column) {
                case 'project':
                    aValue = a.project.toLowerCase();
                    bValue = b.project.toLowerCase();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'progress':
                    aValue = a.progress;
                    bValue = b.progress;
                    break;
                case 'tasks':
                    aValue = a.tasks.completed / a.tasks.total;
                    bValue = b.tasks.completed / b.tasks.total;
                    break;
                case 'potential':
                    const potentialOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    aValue = potentialOrder[a.potential] || 0;
                    bValue = potentialOrder[b.potential] || 0;
                    break;
                case 'projectStart':
                    aValue = new Date(a.projectStart);
                    bValue = new Date(b.projectStart);
                    break;
                case 'dateStarted':
                    aValue = a.dateStarted ? new Date(a.dateStarted) : new Date(0);
                    bValue = b.dateStarted ? new Date(b.dateStarted) : new Date(0);
                    break;
                case 'urgency':
                    const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    aValue = urgencyOrder[a.urgency] || 0;
                    bValue = urgencyOrder[b.urgency] || 0;
                    break;
                default:
                    return 0;
            }

            if (direction === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    }
};