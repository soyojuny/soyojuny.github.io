// Firebase 설정 및 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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
export async function getCollectionData(collectionName, filters = []) {
    try {
        const ref = collection(db, collectionName);

        // filters 배열이 비어 있지 않으면, query로 변환
        let q = ref;
        if (filters.length > 0) {
            q = query(ref, ...filters); // filters 배열을 query로 전달
        }

        const querySnapshot = await getDocs(q);
        const dataList = [];
        querySnapshot.forEach((doc) => {
            dataList.push({ id: doc.id, ...doc.data() });
        });

        return dataList; // 빈 배열이라도 반환
    } catch (error) {
        console.error("Error fetching Firestore data:", error);
        return []; // 오류가 발생하면 빈 배열을 반환
    }
}
