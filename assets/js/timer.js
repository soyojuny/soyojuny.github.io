import { getDocumentData, updateDocumentData } from "./firebase.js";

function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        collectionPath: params.get("collectionPath"),
        id: params.get("itemId"),
    };
}

// Firestore 데이터 가져오기
async function fetchFirestoreData(collectionPath, id) {
    try {
        const doc = await getDocumentData(`${collectionPath}/${id}`);
        return doc;
    } catch (error) {
        console.error("Error fetching Firestore doc:", error);
        return null;
    }
}

// Title 표시
function renderTitle(title) {
    const titleContainer = document.getElementById("titleContainer");
    titleContainer.textContent = title;
}

// 타이머 로직
let interval = null;
let seconds = 0;
let isRunning = false;

function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timer = document.getElementById("timer");
    timer.textContent = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function toggleCompleteButton(enable) {
    const completeButton = document.getElementById("completeButton");
    completeButton.disabled = !enable;
}

function startPauseTimer() {
    const startPauseBtn = document.getElementById("startPauseBtn");

    if (!isRunning) {
        // 타이머 시작
        interval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
        startPauseBtn.textContent = "중지";
        startPauseBtn.classList.remove("button-start");
        startPauseBtn.classList.add("button-pause");
        isRunning = true;
        toggleCompleteButton(false); // 타이머 실행 중에는 비활성화
    } else {
        // 타이머 중지
        clearInterval(interval);
        startPauseBtn.textContent = "시작";
        startPauseBtn.classList.remove("button-pause");
        startPauseBtn.classList.add("button-start");
        isRunning = false;
        toggleCompleteButton(true); // 타이머 중지 후 활성화
    }
}

function resetTimer() {
    clearInterval(interval);
    seconds = 0;
    updateTimerDisplay();
    const startPauseBtn = document.getElementById("startPauseBtn");
    startPauseBtn.textContent = "시작";
    startPauseBtn.classList.remove("button-pause");
    startPauseBtn.classList.add("button-start");
    isRunning = false;
    toggleCompleteButton(false); // 초기화 시 비활성화
}

async function updateStatusToDone() {
    const { collectionPath, id } = getParams();

    if (!collectionPath || !id) {
        console.error("Missing collectionPath or itemId in URL");
        return;
    }

    try {
        await updateDocumentData(`${collectionPath}/${id}`, { status: "check" });
        console.log("Document status updated to 'done'");
        window.history.back(); // 이전 화면으로 돌아가기
    } catch (error) {
        console.error("Error updating document status:", error);
    }
}

// 페이지 초기화
async function renderPage() {
    const { collectionPath, id } = getParams();

    if (!collectionPath || !id) {
        console.error("Missing collectionPath or itemId in URL");
        return;
    }

    const data = await fetchFirestoreData(collectionPath, id);

    if (data) {
        renderTitle(data.title);
    } else {
        console.error("No data found or error fetching data");
    }
}

// DOMContentLoaded 이벤트
document.addEventListener("DOMContentLoaded", () => {
    renderPage();

    document.getElementById("startPauseBtn").addEventListener("click", startPauseTimer);
    document.getElementById("resetBtn").addEventListener("click", resetTimer);

    const completeButton = document.getElementById("completeButton");
    completeButton.addEventListener("click", updateStatusToDone);
});
