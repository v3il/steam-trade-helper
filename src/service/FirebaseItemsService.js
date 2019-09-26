import firebase from 'firebase';

import firebaseConfig from '../../firebase-config';

if(!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

import axios from 'axios';

const API_URL = 'http://194.32.79.212:3000/items';


export default {
    async getAllBookmarkedItems() {
        try {
            const response = await axios.get(`${API_URL}/`);
            return response.data;
        } catch (e) {
            return [];
        }
    },

    async addToBookmarks({ itemId, itemName }) {
        try {
            await axios.post(`${API_URL}/`, { itemId, itemName });
            return true;
        } catch (e) {
            return false;
        }
    },

    async removeFromBookmarks({ itemId }) {
        try {
            await axios.delete(`${API_URL}/`, { data: { itemId } });
            return true;
        } catch (e) {
            return false;
        }
    },

    async isBookmarked({ itemId }) {
        try {
            const response = await axios.post(`${API_URL}/check`, {
                itemId
            });

            return response.data.isBookmarked;
        } catch (e) {
            return false;
        }
    },

    async getSettings() {
        try {
            const querySnapshot = await db.collection("settings").get();
            return querySnapshot.docs[0].data();
        } catch (e) {
            return false;
        }
    },

    async updateSettings(settings) {
        try {
            const querySnapshot = await db.collection("settings").get();

            querySnapshot.forEach((doc) => {
                db.collection("settings").doc(doc.id).update(settings);
            });
        } catch (e) {
            return false;
        }
    },
}