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
let isPlaying = false; // 현재 듣기 상태
function setupAudioPlayer(src) {
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseButton = document.getElementById('playPauseButton');
    const replayButton = document.getElementById('replayButton');
    const playCountText = document.getElementById('playCountText');
    const completeButton = document.getElementById('completeButton');

    audioPlayer.src = src;
    audioPlayer.controls = true; // 기본 컨트롤 표시
    audioPlayer.style.pointerEvents = "none"; // 진행 바 클릭 비활성화
    playCount = 0;
    playCountText.textContent = `듣기 횟수: ${playCount}`;
    completeButton.disabled = true;

    // 듣기/일시 정지 버튼 클릭 이벤트
    playPauseButton.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
            playPauseButton.textContent = "듣기";
        } else {
            audioPlayer.play();
            playPauseButton.textContent = "일시 정지";
        }
        isPlaying = !isPlaying;
    });

    // 다시 듣기 버튼 클릭 이벤트
    replayButton.addEventListener('click', () => {
        audioPlayer.currentTime = 0; // 처음부터 듣기
        audioPlayer.play();
        playPauseButton.textContent = "일시 정지";
        isPlaying = true;
    });

    // 오디오 듣기이 끝났을 때
    audioPlayer.onended = function () {
        isPlaying = false;
        playPauseButton.textContent = "듣기";

        if (playCount < 5) {
            playCount++;
            playCountText.textContent = `듣기 횟수: ${playCount}`;

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
        await updateDocumentData(`${collectionPath}/${id}`, { status: "check" });
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
        setupAudioPlayer(src);
    } else {
        console.error("데이터를 찾을 수 없거나 가져오기 오류");
    }
}

// 페이지 로드 시 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
    renderPage();
    document.getElementById('completeButton').addEventListener('click', updateStatusToDone);
});
