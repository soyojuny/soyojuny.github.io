// Firebase 설정 및 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, doc, getDoc, updateDoc, addDoc, runTransaction, increment as firestoreIncrement } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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
        console.log("Fetching data from collection:", collectionName);
        console.log("Applied filters:", filters);

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

        console.log("Fetched data:", dataList);
        return dataList; // 빈 배열이라도 반환
    } catch (error) {
        console.error("Error fetching Firestore data:", error);
        return []; // 오류가 발생하면 빈 배열을 반환
    }
}

// 문서 조회 함수
export async function getDocumentData(documentPath) {
    try {
        const docRef = doc(db, documentPath); // 문서 참조 생성
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            return docSnap.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching document:", error.message);
        return null;
    }
}

// Firestore 문서 업데이트 함수
export async function updateDocumentData(documentPath, data) {
    try {
        const docRef = doc(db, documentPath); // 문서 참조 생성
        await updateDoc(docRef, data); // 문서 업데이트
        console.log("Document successfully updated!");
    } catch (error) {
        console.error("Error updating document:", error);
    }
}

// Firestore 문서 추가 함수
export async function addDocumentData(collectionName, data) {
    try {
        const collectionRef = collection(db, collectionName); // 컬렉션 참조 생성
        const docRef = await addDoc(collectionRef, data); // 문서 추가
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document:", error);
    }
}

// 트랜잭션으로 상태와 포인트를 동시에 안전하게 변경
export async function safelyUpdateHomeworkAndPoints(documentPath, point) {
    const itemRef = doc(db, documentPath);
    const pointRef = doc(db, `/john/point`);

    await runTransaction(db, async (transaction) => {
        const itemSnap = await transaction.get(itemRef);
        if (!itemSnap.exists()) throw new Error("Item not found");

        const currentStatus = itemSnap.data().status;
        if (currentStatus !== "check") {
            throw new Error("Already claimed");
        }

        transaction.update(itemRef, { status: "done" });
        transaction.update(pointRef, { total: firestoreIncrement(point) });
    });
}