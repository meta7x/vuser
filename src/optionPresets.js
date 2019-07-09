export default {
    FIREBASE_OPTIONS: {
        cacheInLocalStorage: true,
        async load(key) {
            const user = firebase.auth().currentUser;

            const doc = await firebase.firestore().collection('vuser').doc(user.uid).collection('data').doc(key).get();
            return doc.data();
        },
        store(key, value) {
            const user = firebase.auth().currentUser;
            return firebase.firestore().collection('vuser').doc(user.uid).collection('data').doc(key).set({ value });
        },
        async authenticate(email, password) {
            if (!firebase.auth().currentUser) {
                await firebase.auth().signInWithEmailAndPassword(email, password);
            }
        }
    }
}