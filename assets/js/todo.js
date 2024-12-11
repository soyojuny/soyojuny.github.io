import { orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getCollectionData } from "./firebase.js";

// 오늘 날짜를 YYYYMMDD 형식으로 반환하는 함수
function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, "0"); // 월은 0부터 시작
    const dd = today.getDate().toString().padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}

// Firestore에서 데이터 가져와 렌더링
async function renderTodoList() {
    const todoList = document.getElementById("todo-list");

    try {
        const data = await getCollectionData("/todo", [
            orderBy("order"), // order 필드 기준으로 정렬
        ]);
        console.log("Fetched Data:", data); // 데이터 확인

        if (data.length === 0) {
            todoList.innerHTML = "<p>데이터가 없습니다.</p>";
            return;
        }

        todoList.innerHTML = ""; // 기존 내용 초기화
        for (const item of data) {
            // 각 항목의 상세 데이터를 조회
            const subItemsData = await getCollectionData(`/todo/${item.id}/items`);
            
            // 오늘 날짜에 해당하는 아이템이 있는지 확인
            const todayItem = subItemsData.find(subItem => subItem.id === todayDate);

            const div = document.createElement("div");
            div.className = "block";

            const span = document.createElement("span");
            span.className = "block-label";
            span.textContent = item.title;

            const button = document.createElement("button");
            button.className = "block-button";

            if (todayItem) {
                // 오늘 날짜에 해당하는 항목이 있으면 "Completed" 버튼
                button.classList.add("completed-button");
                button.textContent = "Completed";
            } else {
                // 오늘 날짜에 해당하는 항목이 없으면 "Waiting" 버튼
                button.classList.add("waiting-button");
                button.textContent = "Waiting";
            }

            button.addEventListener("click", () => navigateToPage(item.link || "#"));

            div.appendChild(span);
            div.appendChild(button);
            todoList.appendChild(div);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        todoList.innerHTML = "<p>데이터를 불러오는 중 오류가 발생했습니다.</p>";
    }
}

// 페이지 이동 함수
function navigateToPage(page) {
    window.location.href = page;
}

// 함수 글로벌로 내보내기
window.navigateToPage = navigateToPage;

// 초기 렌더링
document.addEventListener("DOMContentLoaded", renderTodoList);
