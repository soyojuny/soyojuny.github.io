import { addDocumentData } from "../firebase.js";

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

// 이미지 캡처 후 Firestore에 저장
saveButton.addEventListener("click", () => {
    if (!capturedImageData) {
        alert("No image captured!");
        return;
    }

    new Compressor(canvasElement.toBlob(), {
        quality: 0.6,
        maxWidth: 800,
        maxHeight: 800,
        success(result) {
            const base64Image = result.toDataURL("image/jpeg");
            const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');

            // Firestore에 이미지 데이터 저장
            addDocumentData("/todo/read/items", {
                image: base64Image,
                timestamp: new Date(),
                date: currentDate
            }).then(() => {
                alert("Image uploaded and saved to Firestore!");
            }).catch(error => {
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
