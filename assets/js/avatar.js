const canvas = document.getElementById('avatarCanvas');
const ctx = canvas.getContext('2d');

// Base Avatar 이미지 미리 로드
const baseImage = new Image();
baseImage.src = '../assets/avatars/base_image.png';
baseImage.onload = renderAvatar; // 이미지가 로드된 후 첫 렌더링

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

    // 헤어 색상 옵션
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

    // 헤어 스타일 옵션
    hairStyles.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.addEventListener('click', () => {
            hair.img = loadImage(src);
            renderAvatar();
        });
        hairStyleContainer.appendChild(img);
    });

    // 액세서리 옵션
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

// 드래그 이벤트 설정
canvas.addEventListener('mousedown', (e) => {
    const { offsetX: x, offsetY: y } = e;
    if (isInObject(x, y, hair)) {
        dragTarget = hair;
    } else if (isInObject(x, y, accessory)) {
        dragTarget = accessory;
    }

    if (dragTarget) {
        offsetX = x - dragTarget.x;
        offsetY = y - dragTarget.y;
    }
});

// 드래그 이동 함수
canvas.addEventListener('mousemove', (e) => {
    if (dragTarget) {
        const { offsetX: x, offsetY: y } = e;
        dragTarget.x = x - offsetX;
        dragTarget.y = y - offsetY;
        renderAvatar();
    }
});

// 드래그 종료
canvas.addEventListener('mouseup', () => {
    dragTarget = null;
});

// 객체 안에 클릭이 되었는지 확인하는 함수
function isInObject(x, y, object) {
    return (
        x > object.x - object.size / 2 &&
        x < object.x + object.size / 2 &&
        y > object.y - object.size / 2 &&
        y < object.y + object.size / 2
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
