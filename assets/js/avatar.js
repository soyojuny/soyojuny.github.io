const canvas = document.getElementById('avatarCanvas');
const ctx = canvas.getContext('2d');

// Base Avatar 이미지 미리 로드
const baseImage = new Image();
baseImage.src = '../assets/avatars/base_image.png';
baseImage.onload = renderAvatar;

// 기본 설정
const hairColors = ['#000', '#8B4513', '#C19A6B', '#FF0000', '#00FF00', '#0000FF'];
const hairStyles = ['../assets/avatars/hairstyles.png', '../assets/avatars/hairstyles2.png'];
const accessories = ['../assets/avatars/accessories.png', '../assets/avatars/accessories2.png'];

// 아바타 설정
let hair = {
    img: null,
    x: canvas.width / 2,
    y: 100,
    size: 120,
    rotation: 0,
};
let accessory = {
    img: null,
    x: canvas.width / 2,
    y: 200,
    size: 100,
    rotation: 0,
};

// 드래그 상태
let dragTarget = null;
let offsetX, offsetY;

// 멀티터치 상태
let isPinching = false;
let initialPinchDistance = null;
let initialSize = null;

// 이미지 로드 함수
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

// 초기 옵션 설정
function initOptions() {
    const hairStyleContainer = document.getElementById('hairStyles');
    const hairColorContainer = document.getElementById('hairColors');

    hairColors.forEach((color) => {
        const div = document.createElement('div');
        div.className = 'color-option';
        div.style.backgroundColor = color;
        div.addEventListener('click', () => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = color;
            ctx.fill();
            renderAvatar();
        });
        hairColorContainer.appendChild(div);
    });

    hairStyles.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.addEventListener('click', () => {
            hair.img = loadImage(src);
            renderAvatar();
        });
        hairStyleContainer.appendChild(img);
    });

    accessories.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.addEventListener('click', () => {
            accessory.img = loadImage(src);
            renderAvatar();
        });
        document.getElementById('accessoriesContainer').appendChild(img);
    });
}

// 이벤트 리스너 등록
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('touchstart', startDrag);

window.addEventListener('mousemove', dragMove); // 변경: window로 이동
window.addEventListener('touchmove', dragMove);

window.addEventListener('mouseup', endDrag); // 변경: window로 이동
canvas.addEventListener('touchend', endDrag);

// 드래그 시작
function startDrag(e) {
    e.preventDefault(); // 기본 동작 방지
    if (e.touches && e.touches.length === 2) {
        // 멀티터치 확대/축소 시작
        isPinching = true;
        initialPinchDistance = getPinchDistance(e);
        initialSize = dragTarget ? dragTarget.size : null;
    } else {
        // 단일 터치 또는 마우스 클릭
        const { x, y } = getEventPosition(e);
        if (isInObject(x, y, hair)) {
            dragTarget = hair;
        } else if (isInObject(x, y, accessory)) {
            dragTarget = accessory;
        }

        if (dragTarget) {
            offsetX = x - dragTarget.x;
            offsetY = y - dragTarget.y;
        }
    }
}

// 드래그 이동
function dragMove(e) {
    if (isPinching && e.touches && e.touches.length === 2) {
        e.preventDefault(); // 기본 스크롤 방지

        // 확대/축소
        const newPinchDistance = getPinchDistance(e);
        const scale = newPinchDistance / initialPinchDistance;

        if (dragTarget && initialSize !== null) {
            dragTarget.size = initialSize * scale;
        }

        // 회전
        const newAngle = getPinchAngle(e);
        if (initialRotationAngle === null) {
            initialRotationAngle = newAngle;
            initialObjectRotation = dragTarget.rotation;
        } else {
            const angleDiff = newAngle - initialRotationAngle;
            dragTarget.rotation = initialObjectRotation + angleDiff;
        }

        renderAvatar();
    } else if (dragTarget) {
        const { x, y } = getEventPosition(e);

        const speedFactor = 1.5; // 속도 가속도 추가
        dragTarget.x += (x - (dragTarget.x + offsetX)) * speedFactor;
        dragTarget.y += (y - (dragTarget.y + offsetY)) * speedFactor;

        renderAvatar();
    }
}

// 드래그 종료
function endDrag(e) {
    if (e.touches && e.touches.length === 0) {
        isPinching = false;
        initialPinchDistance = null;
        initialSize = null;
        initialRotationAngle = null; // 회전 초기화
        initialObjectRotation = null;
    }
    dragTarget = null;
}

// 두 터치 간 거리 계산
function getPinchDistance(e) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const angle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
    );
    return (angle * 180) / Math.PI; // 라디안을 각도로 변환
}

// 이벤트의 실제 위치 계산
function getEventPosition(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
        };
    } else {
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }
}

// 객체 안에 클릭이 되었는지 확인
function isInObject(x, y, object) {
    // 이미지 전체 영역을 기준으로 좌표 체크
    const halfWidth = object.size / 2;
    const halfHeight = object.size / 2;
    return (
        x > object.x - halfWidth &&
        x < object.x + halfWidth &&
        y > object.y - halfHeight &&
        y < object.y + halfHeight
    );
}

// 헤어 삭제 버튼
document.getElementById('removeHairButton').addEventListener('click', () => {
    hair.img = null;  // 헤어 삭제
    renderAvatar();
});

// 액세서리 삭제 버튼
document.getElementById('removeAccessoryButton').addEventListener('click', () => {
    accessory.img = null;  // 액세서리 삭제
    renderAvatar();
});

// 헤어 추가 버튼
document.getElementById('addHairButton').addEventListener('click', () => {
    hair.img = loadImage('assets/avatars/hairstyles.png');  // 기본 헤어 스타일로 설정
    renderAvatar();
});

// 액세서리 추가 버튼
document.getElementById('addAccessoryButton').addEventListener('click', () => {
    accessory.img = loadImage('assets/avatars/accessories.png');  // 기본 액세서리로 설정
    renderAvatar();
});

// 회전 및 크기 조절 슬라이더 이벤트
document.getElementById('hairSize').addEventListener('input', (e) => {
    hair.size = e.target.value;
    renderAvatar();
});
document.getElementById('accessorySize').addEventListener('input', (e) => {
    accessory.size = e.target.value;
    renderAvatar();
});
document.getElementById('hairRotation').addEventListener('input', (e) => {
    hair.rotation = e.target.value;
    renderAvatar();
});
document.getElementById('accessoryRotation').addEventListener('input', (e) => {
    accessory.rotation = e.target.value;
    renderAvatar();
});

// 아바타 렌더링
function renderAvatar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    
    if (hair.img) {
        drawRotatedImage(hair);
    }
    
    if (accessory.img) {
        drawRotatedImage(accessory);
    }
}

// 회전된 이미지를 그리는 함수
function drawRotatedImage(object) {
    ctx.save();
    ctx.translate(object.x, object.y);
    ctx.rotate((object.rotation * Math.PI) / 180);
    ctx.drawImage(object.img, -object.size / 2, -object.size / 2, object.size, object.size);
    ctx.restore();
}

// 이미지 저장 기능
document.getElementById('saveButton').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'avatar.png';
    link.href = canvas.toDataURL();
    link.click();
});

// 초기화
initOptions();
renderAvatar();
