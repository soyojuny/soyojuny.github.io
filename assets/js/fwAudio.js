// 페이지 로드 시 재생 횟수 초기화
let playCount = 0;
const playCountElement = document.getElementById('playCount');
const audioPlayer = document.getElementById('audioPlayer');

// 오디오가 재생될 때마다 카운트를 증가시킴
audioPlayer.addEventListener('play', () => {
    playCount++;
    playCountElement.textContent = playCount;
});
