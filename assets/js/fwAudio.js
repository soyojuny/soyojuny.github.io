import { getDocumentData, updateDocumentData } from "./firebase.js";

// URL에서 collectionPath와 id를 추출하는 함수
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
        console.error("Firestore 문서 가져오기 오류:", error);
        return null;
    }
}

// 오디오 플레이어 상태 관리
let playCount = 0;
function updateAudioPlayer(src) {
    const audioPlayer = document.getElementById('audioPlayer');
    const playCountText = document.getElementById('playCountText');
    const completeButton = document.getElementById('completeButton');

    audioPlayer.src = src;
    playCount = 0;
    playCountText.textContent = `듣기 횟수: ${playCount}`;

    // 오디오 재생이 완전히 완료된 후 카운트 증가
    audioPlayer.onended = function() {
        // 5회 미만일 때만 카운트 증가
        if (playCount < 5) {
            playCount++;
            playCountText.textContent = `듣기 횟수: ${playCount}`;

            // 5회 도달 시 완료 버튼 활성화
            if (playCount >= 5) {
                completeButton.disabled = false;
            }
        }
    };
}

// 완료 버튼 클릭 시 Firestore 문서 상태 업데이트
async function updateStatusToDone() {
    const { collectionPath, id } = getParams();

    if (!collectionPath || !id) {
        console.error("URL에 collectionPath 또는 itemId 누락");
        return;
    }

    try {
        await updateDocumentData(`${collectionPath}/${id}`, { status: "done" });
        window.history.back();
    } catch (error) {
        console.error("문서 상태 업데이트 오류:", error);
    }
}

// 페이지 렌더링 함수
async function renderPage() {
    const { collectionPath, id } = getParams();

    if (!collectionPath || !id) {
        console.error("URL에 collectionPath 또는 itemId 누락");
        return;
    }

    const data = await fetchFirestoreData(collectionPath, id);

    if (data) {
        const { title, src } = data;
        const titleContainer = document.getElementById('titleContainer');
        titleContainer.textContent = title;
        updateAudioPlayer(src);
    } else {
        console.error("데이터를 찾을 수 없거나 가져오기 오류");
    }
}

// 페이지 로드 시 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
    renderPage();
    document.getElementById('completeButton').addEventListener('click', updateStatusToDone);
});