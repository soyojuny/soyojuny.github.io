import { getDocumentData } from "./firebase.js";

// 포인트를 가져와 표시하는 함수
async function fetchAndDisplayPoints() {
    const pointDisplay = document.getElementById("point-display");
    try {
        const pointDoc = await getDocumentData("john/point");
        const totalPoints = pointDoc.total || 0;
        pointDisplay.textContent = `${totalPoints} Points`; // 포인트를 보여줌
    } catch (error) {
        console.error("Error fetching points:", error);
        pointDisplay.textContent = "Error loading points."; // 에러 처리
    }
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", fetchAndDisplayPoints);
