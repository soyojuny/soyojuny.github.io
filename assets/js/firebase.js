// Firebase 설정 및 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDQ5v5NsVKwnXtu_ZMvhsYXa8IpMSloguM",
    authDomain: "test-9453b.firebaseapp.com",
    projectId: "test-9453b",
    storageBucket: "test-9453b.firebasestorage.app",
    messagingSenderId: "741728204546",
    appId: "1:741728204546:web:6081c04b8cbe20b049741b"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firebase Firestore의 CRUD 함수
export async function getCollectionData(collectionName) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const dataList = [];
    querySnapshot.forEach((doc) => {
        dataList.push({ id: doc.id, ...doc.data() });
    });
    return dataList;
}
