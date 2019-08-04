import firebase from 'firebase';

import firebaseConfig from '../firebase-config';

if(!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export default {
    async getAllBookmarkedItems() {
        try {
            const querySnapshot = await db.collection("bookmarked-items").get();
            const result = [];

            querySnapshot.forEach(function(doc) {
                result.push(doc.data());
            });

            return result;
        } catch (e) {
            return [];
        }
    },

    async addToBookmarks({ itemId, itemName }) {
        try {
            db.collection("bookmarked-items")
                .add({ itemId, itemName });

            return true;
        } catch (e) {
            return false;
        }
    },

    async removeFromBookmarks({ itemId }) {
        try {
            const querySnapshot = await db.collection("bookmarked-items")
                .where("itemId", "==", itemId)
                .get();

            querySnapshot.forEach(function(doc) {
                doc.ref.delete();
            });

            return true;
        } catch (e) {
            return false;
        }
    },

    async isBookmarked({ itemId }) {
        try {
            const querySnapshot = await db.collection("bookmarked-items")
                .where("itemId", "==", itemId)
                .get();

            return querySnapshot.size > 0;
        } catch (e) {
            return false;
        }
    },
}