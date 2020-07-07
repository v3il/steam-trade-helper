import axios from '@/axios';

export default {
    async getAllBookmarkedItems() {
        try {
            const response = await axios.get('/items');
            return response.data;
        } catch (e) {
            return [];
        }
    },

    async addToBookmarks(itemData) {
        try {
            await axios.post('/items', itemData);
            return true;
        } catch (e) {
            return false;
        }
    },

    async removeFromBookmarks({ itemId }) {
        try {
            await axios.delete('/items', { data: { itemId } });
            return true;
        } catch (e) {
            return false;
        }
    },

    async isBookmarked({ itemId }) {
        try {
            const response = await axios.get('/items/check', {
                params: { itemId }
            });

            return response.data.isBookmarked;
        } catch (e) {
            return false;
        }
    },

    async getSettings() {
        try {
            const response = await axios.get('/settings');
            return response.data;
        } catch (e) {
            return false;
        }
    },

    async updateSettings(settings) {
        try {
            await axios.post('/settings', settings);
            return true;
        } catch (e) {
            return false;
        }
    },

    async setWatchStatus(data) {
        try {
            await axios.post('/items/set_watch_status', data);
            return true;
        } catch (e) {
            return false;
        }
    },

    async bookmarkCase(data) {
        try {
            await axios.post('/dynamic_items', data);
            return true;
        } catch (e) {
            return false;
        }
    },

    async updateCasePrice(data) {
        try {
            await axios.post('/dynamic_items/update_price', data);
            return true;
        } catch (e) {
            return false;
        }
    }
}