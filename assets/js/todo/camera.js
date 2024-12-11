import { addDocumentData } from "../firebase.js";

// 카메라 연결 함수
async function initCamera() {
    try {
        // 후면 카메라를 사용하도록 설정
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" } // facingMode를 "environment"로 설정
        });
        
        // 비디오 요소에 스트림을 연결
        const videoElement = document.getElementById("video");
        videoElement.srcObject = stream;
    } catch (error) {
        console.error("Error accessing the camera:", error);
    }
}

// 이미지 캡처 함수
function captureImage() {
    const videoElement = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    // 캡처할 이미지를 캔버스에 그리기
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // 캡처한 이미지를 base64 형식으로 변환
    const imageData = canvas.toDataURL("image/jpeg");

    // 캡처한 이미지를 화면에 미리 보기
    const capturedImage = document.getElementById("capturedImage");
    capturedImage.src = imageData;
    capturedImage.style.display = "block";

    // 저장 버튼 표시
    const saveButton = document.getElementById("saveButton");
    saveButton.style.display = "inline-block";
}

// 저장 버튼 클릭 시 Firebase에 이미지 저장 함수
async function saveImageToFirestore() {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, ""); // 오늘 날짜 (예: 20241211)
    
    // 캡처된 이미지 데이터
    const imageData = document.getElementById("capturedImage").src;
    
    const imageRef = `/todo/read/items/${date}`;
    const imageDataObj = {
        image: imageData,
        date: date
    };

    // 데이터 저장
    await addDocumentData(imageRef, imageDataObj);
    console.log("Image saved to Firestore successfully.");
}

// 페이지 로드 시 카메라 초기화 및 이미지 갤러리 렌더링
document.addEventListener("DOMContentLoaded", () => {
    initCamera();

    // 캡처 버튼 클릭 시 이미지 캡처
    const captureButton = document.getElementById("captureButton");
    captureButton.addEventListener("click", captureImage);

    // 저장 버튼 클릭 시 이미지 저장
    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", saveImageToFirestore);
});