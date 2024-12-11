import { getCollectionData } from "../firebase";

const videoElement = document.getElementById("video");
const captureButton = document.getElementById("capture");
const saveButton = document.getElementById("saveToFirestore");
const canvasElement = document.getElementById("canvas");
const canvasContext = canvasElement.getContext("2d");

let capturedImageData = null;

// 카메라 연결 함수
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
    } catch (error) {
        console.error("Error accessing the camera:", error);
    }
}

// 사진 찍기 함수
captureButton.addEventListener("click", () => {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    capturedImageData = canvasElement.toDataURL("image/png"); // Base64 이미지 데이터로 변환
});

// Firestore에 이미지 저장 함수
saveButton.addEventListener("click", () => {
    if (!capturedImageData) {
        alert("No image captured!");
        return;
    }

    // 이미지를 압축하고 base64로 변환
    new Compressor(canvasElement.toBlob(), {
        quality: 0.6, // 압축 품질 (0~1 사이)
        maxWidth: 800, // 최대 너비
        maxHeight: 800, // 최대 높이
        success(result) {
            const base64Image = result.toDataURL("image/jpeg"); // 압축된 이미지를 base64로 변환
            const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, ''); // 오늘 날짜 (YYYYMMDD 형식)

            // Firestore에 저장
            firestore.collection("/todo/read/items").doc(currentDate).set({
                image: base64Image,  // base64 이미지 데이터
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                alert("Image uploaded and saved to Firestore!");
            })
            .catch(error => {
                console.error("Error saving image to Firestore:", error);
            });
        },
        error(err) {
            console.error("Error during image compression:", err);
        }
    });
});

// 카메라 시작
startCamera();
