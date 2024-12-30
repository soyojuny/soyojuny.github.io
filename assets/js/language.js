import { where, orderBy, increment } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getCollectionData, updateDocumentData } from "./firebase.js";

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
        // 1. 오늘 날짜부터 5일 전까지 데이터 필터링
        const dateRangeFilter = where("date", ">=", fiveDaysAgo);  // 5일 전 이후
        const todayFilter = where("date", "<=", today); // 오늘 이전

        // Firestore에서 데이터를 가져올 때, `orderBy`를 추가하여 부등호 필드 정렬을 먼저 지정
        // 먼저 "date"를 기준으로 정렬하고, 그 이후 "order" 필드로 추가적인 정렬을 합니다.
        const filteredData = await getCollectionData("/homework/Language Framework/items", [
            dateRangeFilter,
            todayFilter,
            orderBy("date"), // date 기준으로 정렬
            orderBy("order"), // order 필드 기준으로 정렬
        ]);

        console.log("Filtered Data:", filteredData);

        return filteredData;
    } catch (error) {
        console.error("Error fetching filtered data:", error);
        return [];
    }
}

// 필터된 데이터 렌더링
async function renderData() {
    const languageHomeworkList = document.getElementById("languageHomework-list");

    try {
        const data = await getFilteredData();
        if (data.length === 0) {
            languageHomeworkList.innerHTML = "<p>데이터가 없습니다.</p>";
            return;
        }

        languageHomeworkList.innerHTML = ""; // 기존 내용 초기화
        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "block";

            const span = document.createElement("span");
            span.className = "block-label";
            span.textContent = item.title;

            const button = document.createElement("button");
            button.className = "block-button";

            // status에 따라 버튼 클래스 및 텍스트 변경
            if (item.status === "check") {
                button.classList.add("check-button");
                button.textContent = `${item.point} point`;
                
                button.addEventListener("click", async () => {
                    event.stopPropagation();
                    try {
                        // status를 finished로 변경
                        await updateDocumentData(`homework/Language Framework/items/${item.id}`, { status: "done" });

                        // /john/point 문서의 total 점수 +10
                        await updateDocumentData('/john/point', { total: increment(item.point) });

                        // 버튼 텍스트와 상태 업데이트
                        button.textContent = "Completed";
                        button.className = "block-button done-button";
                        
                        // alert(`Status updated to finished and 10 points added to total.`);
                    } catch (error) {
                        console.error("Error updating status or points:", error);
                    }
                });
            } else if (item.status === "waiting") {
                button.classList.add("waiting-button");
                button.textContent = "Homework";

                button.addEventListener("click", () => navigateToPage(item.link, item.id));
            } else if (item.status === "done") {
                button.classList.add("done-button");
                button.textContent = "Completed";
                button.style.cursor = "pointer";

                button.addEventListener("click", () => navigateToPage(item.link, item.id));
            }

            div.appendChild(span);
            div.appendChild(button);
            languageHomeworkList.appendChild(div);
        });
    } catch (error) {
        console.error("Error rendering data:", error);
    }
}

// 페이지 이동 함수
function navigateToPage(page, itemId) {
    const collectionPath = "/homework/Language Framework/items";
    const nextPageUrl = `${page}?collectionPath=${encodeURIComponent(collectionPath)}&itemId=${encodeURIComponent(itemId)}`;
    window.location.href = nextPageUrl;
}

// 초기 렌더링
document.addEventListener("DOMContentLoaded", renderData);
