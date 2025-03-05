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

// 비디오 플레이어 상태 관리
let playCount = 0;
let isPlaying = false; // 현재 재생 상태

function setupVideoPlayer(src) {
    const videoPlayer = document.getElementById('videoPlayer');
    const playPauseButton = document.getElementById('playPauseButton');
    const replayButton = document.getElementById('replayButton');
    const playCountText = document.getElementById('playCountText');
    const completeButton = document.getElementById('completeButton');

    videoPlayer.src = src;
    videoPlayer.controls = true; // 기본 컨트롤 표시
    playCount = 0;
    playCountText.textContent = `시청 횟수: ${playCount}`;
    completeButton.disabled = true;

    // 전체 화면에서 재생하는 함수
    function playFullScreen() {
        if (!isPlaying) {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.mozRequestFullScreen) { // Firefox 지원
                videoPlayer.mozRequestFullScreen();
            } else if (videoPlayer.webkitRequestFullscreen) { // Chrome, Safari 지원
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) { // IE/Edge 지원
                videoPlayer.msRequestFullscreen();
            }
            videoPlayer.play();
            playPauseButton.textContent = "일시 정지";
            isPlaying = true;
        } else {
            videoPlayer.pause();
            playPauseButton.textContent = "재생";
            isPlaying = false;
        }
    }

    // 재생 버튼 클릭 이벤트 (전체 화면 실행)
    playPauseButton.addEventListener('click', playFullScreen);

    // 다시 보기 버튼 클릭 이벤트
    replayButton.addEventListener('click', () => {
        videoPlayer.currentTime = 0; // 처음부터 재생
        videoPlayer.play();
        playPauseButton.textContent = "일시 정지";
        isPlaying = true;
    });

    // 비디오 재생이 끝났을 때
    videoPlayer.onended = function () {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        isPlaying = false;
        playPauseButton.textContent = "재생";

        if (playCount < 3) {
            playCount++;
            playCountText.textContent = `시청 횟수: ${playCount}`;

            if (playCount >= 3) {
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
        setupVideoPlayer(src);
    } else {
        console.error("데이터를 찾을 수 없거나 가져오기 오류");
    }
}

// 페이지 로드 시 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
    renderPage();
    document.getElementById('completeButton').addEventListener('click', updateStatusToDone);
});
