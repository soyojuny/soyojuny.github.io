import { where, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
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

// Firestore에서 데이터 가져와 렌더링
async function renderHomeworkList() {
    const homeworkList = document.getElementById("homework-list");

    const today = getFormattedDate(); // 오늘 날짜
    const fiveDaysAgo = getFormattedDate(-5); // 5일 전 날짜

    try {
        const data = await getCollectionData("/homework", [
            orderBy("order"), // order 필드 기준으로 정렬
        ]);
        console.log("Fetched Data:", data); // 데이터 확인

        if (data.length === 0) {
            homeworkList.innerHTML = "<p>데이터가 없습니다.</p>";
            return;
        }

        homeworkList.innerHTML = ""; // 기존 내용 초기화
        for (const item of data) {
            // 1. 오늘 날짜부터 5일 전까지 데이터 필터링
            const dateRangeFilter = where("date", ">=", fiveDaysAgo);  // 5일 전 이후
            const todayFilter = where("date", "<=", today); // 오늘 이전

            // 각 항목의 상세 데이터를 조회
            const subItemsData = await getCollectionData(`/homework/${item.id}/items`, [
                dateRangeFilter,
                todayFilter,
            ]);
            const allDone = subItemsData.every(subItem => subItem.status === "done"); // 모든 하위 항목이 "done"인지 확인

            const div = document.createElement("div");
            div.className = "block";

            const span = document.createElement("span");
            span.className = "block-label";
            span.textContent = item.title;

            const button = document.createElement("button");
            button.className = "block-button";

            // status에 따라 버튼 클래스 변경
            if (allDone) {
                button.classList.add("done-button"); // 모든 하위 항목이 "done"이면 "done-button" 적용
                button.textContent = "Completed"; // 버튼 텍스트 "Done"
                button.style.cursor = "pointer"; // 클릭 금지 표시 제거
            } else {
                button.classList.add("waiting-button"); // 일부라도 "done"이 아닌 상태면 "waiting-button" 적용
                button.textContent = "Homework"; // 버튼 텍스트 "Homework"
            }

            button.addEventListener("click", () => navigateToPage(item.link || "#"));

            div.appendChild(span);
            div.appendChild(button);
            homeworkList.appendChild(div);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        homeworkList.innerHTML = "<p>데이터를 불러오는 중 오류가 발생했습니다.</p>";
    }
}

// 페이지 이동 함수
function navigateToPage(page) {
    window.location.href = page;
}

// 함수 글로벌로 내보내기
window.navigateToPage = navigateToPage;

// 초기 렌더링
document.addEventListener("DOMContentLoaded", renderHomeworkList);
