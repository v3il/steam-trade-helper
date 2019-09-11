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
            const items = response.data;

            return items;

            // console.log(response);

            // console.log(111)

            // const querySnapshot = await db.collection("bookmarked-items").get();
            // const result = [];
            //
            // querySnapshot.forEach(function(doc) {
            //     result.push(doc.data());
            // });
            //
            // return result;
        } catch (e) {
            console.log(e)

            return [];
        }
    },

    async addToBookmarks({ itemId, itemName }) {
        try {
            const result = await axios.post(`${API_URL}/`, { itemId, itemName });

            console.log(result);

            // await db.collection("bookmarked-items")
            //     .add({ itemId, itemName });

            return true;
        } catch (e) {
            return false;
        }
    },

    async removeFromBookmarks({ itemId }) {
        try {
            const result = await axios.delete(`${API_URL}/`, { data: { itemId } });

            console.log(result)


            // const querySnapshot = await db.collection("bookmarked-items")
            //     .where("itemId", "==", itemId)
            //     .get();
            //
            // querySnapshot.forEach(function(doc) {
            //     doc.ref.delete();
            // });

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

            // const querySnapshot = await db.collection("bookmarked-items")
            //     .where("itemId", "==", itemId)
            //     .get();
            //
            // return querySnapshot.size > 0;
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