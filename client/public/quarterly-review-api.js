/**
 * Quarterly Review API Wrapper
 * Replaces localStorage with PostgreSQL database calls
 */

class QuarterlyReviewAPI {
    constructor() {
        this.baseUrl = '/api/quarterly-review';
        this.currentReviewId = null;
        this.currentQuarter = null;
        this.cache = {};
    }

    /**
     * Initialize and get or create quarterly review
     */
    async init(quarter, year) {
        try {
            const response = await fetch(`${this.baseUrl}/${quarter}/${year}`);
            if (!response.ok) throw new Error('Failed to load quarterly review');
            
            const review = await response.json();
            this.currentReviewId = review.id;
            this.currentQuarter = `${quarter} ${year}`;
            
            return review;
        } catch (error) {
            console.error('Error initializing quarterly review:', error);
            throw error;
        }
    }

    /**
     * Emotional Alchemy
     */
    async getEmotionalAlchemy() {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/emotional-alchemy`);
        if (!response.ok) throw new Error('Failed to load emotional alchemy');
        
        return await response.json();
    }

    async saveEmotionalAlchemy(session) {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/emotional-alchemy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session)
        });
        
        if (!response.ok) throw new Error('Failed to save emotional alchemy');
        return await response.json();
    }

    async deleteEmotionalAlchemy(id) {
        const response = await fetch(`${this.baseUrl}/emotional-alchemy/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete emotional alchemy');
        return await response.json();
    }

    /**
     * Life Inventory
     */
    async getLifeInventory() {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/life-inventory`);
        if (!response.ok) throw new Error('Failed to load life inventory');
        
        return await response.json();
    }

    async saveLifeInventory(inventory) {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/life-inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inventory)
        });
        
        if (!response.ok) throw new Error('Failed to save life inventory');
        return await response.json();
    }

    /**
     * Letters
     */
    async getLetters() {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/letters`);
        if (!response.ok) throw new Error('Failed to load letters');
        
        return await response.json();
    }

    async saveLetter(letter) {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/letters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(letter)
        });
        
        if (!response.ok) throw new Error('Failed to save letter');
        return await response.json();
    }

    async updateLetter(id, letter) {
        const response = await fetch(`${this.baseUrl}/letters/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(letter)
        });
        
        if (!response.ok) throw new Error('Failed to update letter');
        return await response.json();
    }

    async updateLetterStatus(id, status) {
        const response = await fetch(`${this.baseUrl}/letters/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) throw new Error('Failed to update letter status');
        return await response.json();
    }

    async deleteLetter(id) {
        const response = await fetch(`${this.baseUrl}/letters/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete letter');
        return await response.json();
    }

    /**
     * Vision Ratings
     */
    async getVisionRatings() {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/vision-ratings`);
        if (!response.ok) throw new Error('Failed to load vision ratings');
        
        return await response.json();
    }

    async saveVisionRatings(ratings) {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/vision-ratings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ratings)
        });
        
        if (!response.ok) throw new Error('Failed to save vision ratings');
        return await response.json();
    }

    /**
     * Daily Affirmations
     */
    async getAffirmations() {
        const response = await fetch(`${this.baseUrl}/affirmations`);
        if (!response.ok) throw new Error('Failed to load affirmations');
        
        return await response.json();
    }

    async saveAffirmation(affirmation) {
        const response = await fetch(`${this.baseUrl}/affirmations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(affirmation)
        });
        
        if (!response.ok) throw new Error('Failed to save affirmation');
        return await response.json();
    }

    async updateAffirmation(id, affirmation) {
        const response = await fetch(`${this.baseUrl}/affirmations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(affirmation)
        });
        
        if (!response.ok) throw new Error('Failed to update affirmation');
        return await response.json();
    }

    async deleteAffirmation(id) {
        const response = await fetch(`${this.baseUrl}/affirmations/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete affirmation');
        return await response.json();
    }

    /**
     * Action Highlights
     */
    async getActionHighlights() {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/action-highlights`);
        if (!response.ok) throw new Error('Failed to load action highlights');
        
        return await response.json();
    }

    async saveActionHighlights(highlights) {
        if (!this.currentReviewId) throw new Error('Review not initialized');
        
        const response = await fetch(`${this.baseUrl}/${this.currentReviewId}/action-highlights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ highlights })
        });
        
        if (!response.ok) throw new Error('Failed to save action highlights');
        return await response.json();
    }

    /**
     * Audio Recordings
     */
    async uploadAudio(audioBlob, recordingType) {
        const formData = new FormData();
        formData.append('file', audioBlob, `${recordingType}-${Date.now()}.wav`);
        formData.append('recordingType', recordingType);
        
        const response = await fetch(`${this.baseUrl}/audio/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to upload audio');
        return await response.json();
    }

    async getLatestAudio(recordingType) {
        const response = await fetch(`${this.baseUrl}/audio/latest/${recordingType}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to load audio');
        }
        
        return await response.json();
    }

    async getAllRecordings() {
        const response = await fetch(`${this.baseUrl}/audio/recordings`);
        if (!response.ok) throw new Error('Failed to load recordings');
        
        return await response.json();
    }

    async deleteRecording(id) {
        const response = await fetch(`${this.baseUrl}/audio/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete recording');
        return await response.json();
    }

    /**
     * Slack Settings
     */
    async getSlackSettings() {
        const response = await fetch(`${this.baseUrl}/slack/settings`);
        if (!response.ok) throw new Error('Failed to load slack settings');
        
        return await response.json();
    }

    async saveSlackSettings(settings) {
        const response = await fetch(`${this.baseUrl}/slack/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        if (!response.ok) throw new Error('Failed to save slack settings');
        return await response.json();
    }

    /**
     * Helper: Debounced auto-save
     */
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
    }
}

// Create global instance
window.quarterlyAPI = new QuarterlyReviewAPI();
