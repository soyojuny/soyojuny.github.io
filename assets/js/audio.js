import { getDocumentData, updateDocumentData } from "./firebase.js";

// URL에서 collectionPath와 id를 추출하는 함수
function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        collectionPath: params.get("collectionPath"),
        id: params.get("itemId"),
    };
}

// Firestore 데이터를 가져오는 함수
async function fetchFirestoreData(collectionPath, id) {
    try {
        // Firestore에서 데이터를 조회
        const doc = await getDocumentData(`${collectionPath}/${id}`);
        return doc;
    } catch (error) {
        console.error("Error fetching Firestore doc:", error);
        return null;
    }
}

// Title을 화면 중앙에 표시
function renderTitle(title) {
    const titleElement = document.createElement("h1");
    titleElement.textContent = title;
    titleElement.style.textAlign = "center"; // 중앙 정렬
    document.body.insertBefore(titleElement, document.body.firstChild); // body의 맨 위에 추가
}

// audio_list 값을 기반으로 오디오 트랙 목록 생성
function generateTracks(audioList) {
    const [start, end] = audioList.split("-").map(Number); // 시작과 끝 값 추출
    const tracks = [];

    for (let i = start; i <= end; i++) {
        tracks.push({
            title: `Track ${i}`,
            src: `../../assets/audio/language/Track ${i}.mp3`,
            icon: "../../assets/images/audio.png", // 필요 시 아이콘 변경 가능
        });
    }
    return tracks;
}

// 오디오 파일 목록을 동적으로 생성하여 페이지에 추가
function renderAudioList(tracks) {
    const audioListDiv = document.getElementById("audioList");
    audioListDiv.innerHTML = ""; // 기존 내용을 초기화

    tracks.forEach((track, index) => {
        const div = document.createElement("div");
        div.className = "audio-item";

        // 오디오 파일 아이콘
        const img = document.createElement("img");
        img.src = track.icon;
        img.alt = track.title;

        // 오디오 파일 재생 버튼
        const button = document.createElement("button");
        button.textContent = track.title; // 버튼에 트랙 이름 표시
        button.addEventListener("click", () => playAudio(track.src, index, tracks.length));

        div.appendChild(img);
        div.appendChild(button);
        audioListDiv.appendChild(div);
    });

    // 완료 버튼 생성 (처음에는 비활성화 상태)
    const completeButton = document.createElement("button");
    completeButton.id = "completeButton";
    completeButton.textContent = "완료";
    completeButton.disabled = true; // 비활성화 상태
    completeButton.addEventListener("click", updateStatusToDone);
    document.body.appendChild(completeButton);
}

// 오디오 파일 재생
function playAudio(src, index, totalTracks) {
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.src = src; // 오디오 파일 경로 설정
    audioPlayer.play(); // 오디오 재생

    // 오디오가 시작될 때 로그 출력
    console.log(`Replaying: ${src} (Track ${index + 1} of ${totalTracks})`);

    // 현재 트랙의 버튼 가져오기
    const audioListDiv = document.getElementById("audioList");
    const currentButton = audioListDiv.querySelectorAll(".audio-item button")[index];

    // 오디오 재생이 끝났을 때 다음 작업을 처리
    audioPlayer.onended = function() {
        // 트랙 종료 시 버튼 스타일 변경
        if (currentButton) {
            currentButton.style.backgroundColor = "#ddd"; // 버튼 배경색 회색으로 변경
            currentButton.style.color = "#666"; // 텍스트 색상도 회색으로 변경
            // currentButton.disabled = true; // 버튼 비활성화
        }
        // 트랙 종료 시 로그 출력
        console.log(`Track ${index + 1} of ${totalTracks} has finished playing.`);

        if (index === totalTracks - 1) {
            // 모든 트랙을 재생한 경우 완료 버튼을 활성화
            enableCompletionButton();
            console.log("All tracks finished. The 'Complete' button is now enabled.");
        }
    };
}

// 완료 버튼 활성화 함수
function enableCompletionButton() {
    const completeButton = document.getElementById("completeButton");
    completeButton.disabled = false; // 버튼 활성화
    console.log("Complete button is now active.");
}

// Firestore 문서의 상태를 'done'으로 업데이트
async function updateStatusToDone() {
    const { collectionPath, id } = getParams();

    if (!collectionPath || !id) {
        console.error("Missing collectionPath or itemId in URL");
        return;
    }

    try {
        const docRef = `${collectionPath}/${id}`;
        await updateDocumentData(docRef, { status: "done" });
        console.log("Document status updated to 'done'");

        // 상태 업데이트 후 이전 페이지로 돌아가기
        window.history.back(); // 이전 페이지로 돌아감
    } catch (error) {
        console.error("Error updating document status:", error);
    }
}

// Firestore 데이터를 기반으로 UI 렌더링
async function renderPage() {
    const { collectionPath, id } = getParams();

    if (!collectionPath || !id) {
        console.error("Missing collectionPath or itemId in URL");
        return;
    }

    const data = await fetchFirestoreData(collectionPath, id);

    if (data) {
        // Title 표시
        renderTitle(data.title);

        // audio_list 값을 기반으로 트랙 목록 생성 및 렌더링
        const tracks = generateTracks(data.audio_list);
        renderAudioList(tracks);
    } else {
        console.error("No data found or error fetching data");
    }
}

// 페이지 로드 시 Firestore 데이터를 기반으로 UI 생성
document.addEventListener("DOMContentLoaded", renderPage);
