import { where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getCollectionData } from "./firebase.js";

// 날짜를 yyyymmdd 형식으로 변환하는 함수
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
        // 오늘 날짜와 같은 데이터 조건 (date == today)
        const todayFilter = where("date", "==", today);

        // 오늘 이전 5일 데이터 + status가 "waiting"인 데이터 조건 (date <= today && status == "waiting")
        const fiveDaysAgoFilter = where("date", "<=", today);
        const statusWaitingFilter = where("status", "==", "waiting");

        // 쿼리 조건 확인 (로그로 찍기)
        console.log("Filters being applied:");
        console.log("Today filter:", todayFilter);
        console.log("Five days ago filter:", fiveDaysAgoFilter);
        console.log("Status waiting filter:", statusWaitingFilter);

        // 데이터 조회
        const data = await getCollectionData("/homework/Fiction & Writing/items", [todayFilter, fiveDaysAgoFilter, statusWaitingFilter]);
        console.log("Filtered Data:", data);
        return data || [];
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
            button.addEventListener("click", () => navigateToPage(item.link || "#"));

            div.appendChild(span);
            div.appendChild(button);
            fictionHomeworkList.appendChild(div);
        });
    } catch (error) {
        console.error("Error rendering data:", error);
    }
}

// 페이지 이동 함수
function navigateToPage(page) {
    window.location.href = page;
}

// 초기 렌더링
document.addEventListener("DOMContentLoaded", renderData);
