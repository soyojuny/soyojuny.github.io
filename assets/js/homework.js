import { getCollectionData } from "./firebase.js";

// Firestore에서 데이터 가져와 렌더링
async function renderHomeworkList() {
    const homeworkList = document.getElementById("homework-list");

    try {
        const data = await getCollectionData("/homework");
        console.log("Fetched Data:", data); // 데이터 확인

        if (data.length === 0) {
            homeworkList.innerHTML = "<p>데이터가 없습니다.</p>";
            return;
        }

        homeworkList.innerHTML = ""; // 기존 내용 초기화
        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "block";

            const span = document.createElement("span");
            span.className = "block-label";
            span.textContent = item.id;

            const button = document.createElement("button");
            button.className = "block-button";

            // status에 따라 버튼 클래스 변경
            if (item.status === "done") {
                button.classList.add("done-button"); // "done" 상태
            } else if (item.status === "waiting") {
                button.classList.add("waiting-button"); // "waiting" 상태
            }

            button.textContent = "Homework";
            button.addEventListener("click", () => navigateToPage(item.link || "#"));

            div.appendChild(span);
            div.appendChild(button);
            homeworkList.appendChild(div);
        });
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
