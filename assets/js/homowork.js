import { getCollectionData } from "./firebase.js";

// Firestore에서 데이터 가져와 렌더링
async function renderHomeworkList() {
    const homeworkList = document.getElementById("homework-list");

    try {
        const data = await getCollectionData("(default)/homework");
        if (data.length === 0) {
            homeworkList.innerHTML = "<p>데이터가 없습니다.</p>";
            return;
        }

        // 데이터를 기반으로 HTML 블록 생성
        homeworkList.innerHTML = data
            .map(item => `
                <div class="block">
                    <span class="block-label">${item.title || "제목 없음"}</span>
                    <button class="block-button" onclick="navigateToPage('${item.link || "#"}')">Homework</button>
                </div>
            `)
            .join("");
    } catch (error) {
        console.error("Error fetching data:", error);
        homeworkList.innerHTML = "<p>데이터를 불러오는 중 오류가 발생했습니다.</p>";
    }
}

// 페이지 이동 함수
function navigateToPage(page) {
    window.location.href = page;
}

// 초기 렌더링
document.addEventListener("DOMContentLoaded", renderHomeworkList);
