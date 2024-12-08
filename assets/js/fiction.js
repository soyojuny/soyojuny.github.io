import { where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getCollectionData } from "./firebase.js";

// 날짜 형식을 yyyyMMdd로 변환하는 함수
function getFormattedDate(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}

// 조건에 맞는 데이터를 조회하는 함수
async function getFilteredData() {
    const today = getFormattedDate(); // 오늘 날짜
    const fiveDaysAgo = getFormattedDate(-5); // 5일 전 날짜

    try {
        // 1. date가 오늘인 데이터
        const todayFilter = where("date", "==", today);
        const todayData = await getCollectionData("/homework/Fiction & Writing/items", [todayFilter]);

        // 2. date가 5일 전부터 어제까지이고, status가 "waiting"인 데이터
        const fiveDaysAgoFilter = where("date", ">=", fiveDaysAgo);
        const yesterdayFilter = where("date", "<", today);
        const statusWaitingFilter = where("status", "==", "waiting");
        const waitingData = await getCollectionData("/homework/Fiction & Writing/items", [
            fiveDaysAgoFilter,
            yesterdayFilter,
            statusWaitingFilter,
        ]);

        // 결과 병합 (필요에 따라 분리도 가능)
        const combinedData = [...todayData, ...waitingData];

        console.log("Today's Data:", todayData);
        console.log("Waiting Data:", waitingData);
        console.log("Combined Data:", combinedData);

        return combinedData;
    } catch (error) {
        console.error("Error fetching filtered data:", error);
        return [];
    }
}

// 필터된 데이터 렌더링
async function renderData() {
    const fictionHomeworkList = document.getElementById("fictionHomework-list");

    try {
        const data = await getFilteredData();
        if (data.length === 0) {
            fictionHomeworkList.innerHTML = "<p>데이터가 없습니다.</p>";
            return;
        }

        fictionHomeworkList.innerHTML = ""; // 기존 내용 초기화
        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "block";

            const span = document.createElement("span");
            span.className = "block-label";
            span.textContent = item.title;

            const button = document.createElement("button");
            button.className = "block-button";
            button.textContent = "Go";
            button.addEventListener("click", () => navigateToPage(item.link, item.id));

            div.appendChild(span);
            div.appendChild(button);
            fictionHomeworkList.appendChild(div);
        });
    } catch (error) {
        console.error("Error rendering data:", error);
    }
}

// 페이지 이동 함수
function navigateToPage(page, itemId) {
    const collectionPath = "/homework/Fiction & Writing/items";
    const nextPageUrl = `${page}?collectionPath=${encodeURIComponent(collectionPath)}&itemId=${encodeURIComponent(itemId)}`;
    window.location.href = nextPageUrl;
}

// 초기 렌더링
document.addEventListener("DOMContentLoaded", renderData);
