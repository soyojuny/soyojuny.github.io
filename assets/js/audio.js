// 오디오 파일 목록
const tracks = [
    {
        title: "Track 1",
        src: "../../assets/audio/language/Track 1.mp3",
        icon: "https://via.placeholder.com/50?text=Track+1", // 예시 아이콘 (실제 아이콘으로 교체 가능)
    },
    {
        title: "Track 2",
        src: "../../assets/audio/language/Track 2.mp3",
        icon: "https://via.placeholder.com/50?text=Track+2", // 예시 아이콘 (실제 아이콘으로 교체 가능)
    },
    {
        title: "Track 3",
        src: "../../assets/audio/language/Track 3.mp3",
        icon: "https://via.placeholder.com/50?text=Track+3", // 예시 아이콘 (실제 아이콘으로 교체 가능)
    },
    {
        title: "Track 4",
        src: "../../assets/audio/language/Track 4.mp3",
        icon: "https://via.placeholder.com/50?text=Track+4", // 예시 아이콘 (실제 아이콘으로 교체 가능)
    }
];

// 오디오 플레이어 엘리먼트
const audioPlayer = document.getElementById("audioPlayer");

// 오디오 파일 목록을 동적으로 생성하여 페이지에 추가하는 함수
function generateAudioList() {
    const audioListDiv = document.getElementById("audioList");

    tracks.forEach((track, index) => {
        const div = document.createElement("div");
        div.className = "audio-item";

        // 오디오 파일 아이콘
        const img = document.createElement("img");
        img.src = track.icon;
        img.alt = track.title;

        // 오디오 파일 재생 버튼
        const button = document.createElement("button");
        button.textContent = `Play ${track.title}`;
        button.addEventListener("click", () => playAudio(track.src));

        div.appendChild(img);
        div.appendChild(button);
        audioListDiv.appendChild(div);
    });
}

// 오디오 파일 재생 함수
function playAudio(src) {
    audioPlayer.src = src;  // 오디오 파일 경로 설정
    audioPlayer.play();  // 오디오 재생
}

// 페이지 로드 시 오디오 목록 생성
document.addEventListener("DOMContentLoaded", generateAudioList);
