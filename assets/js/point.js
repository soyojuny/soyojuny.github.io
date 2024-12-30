import { Timestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getDocumentData, getCollectionData, addDocumentData, updateDocumentData } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const currentPointEl = document.getElementById('current-point');
    const couponListEl = document.getElementById('coupon-list-items');
    const pointhistoryEl = document.getElementById('point-history-items');
    const exchangeButton = document.getElementById('exchange-button');
    const toggleCouponListButton = document.getElementById('toggle-coupon-list');
    const couponListContainer = document.getElementById('coupon-list');

    // 현재 포인트 가져오기
    const updatePoints = async () => {
        const pointData = await getDocumentData('john/point');
        currentPointEl.textContent = `${pointData.total} P`;
    };

    // 쿠폰 목록 업데이트
    const updateCoupons = async () => {
        const coupons = await getCollectionData('john/coupon/coupons');
        couponListEl.innerHTML = '';
        coupons.forEach(coupon => {
            const statusText = coupon.status === 'non-use' ? '사용가능' : '사용함';
            const statusColor = coupon.status === 'non-use' ? 'text-blue-500' : 'text-red-500';
            const listItem = `
                <li class="flex justify-between items-center">
                    <div>
                        <p class="font-medium">${coupon.name}</p>
                        <p class="text-sm text-gray-500">발급일: ${formatDate(coupon.date)}</p>
                    </div>
                    <span class="${statusColor}">${statusText}</span>
                </li>`;
            couponListEl.insertAdjacentHTML('beforeend', listItem);
        });
    };

    // 포인트 사용 목록
    const pointhistory = async () => {
        const coupons = await getCollectionData('john/coupon/coupons');
        pointhistoryEl.innerHTML = '';
        coupons.forEach(coupon => {
            const listItem = `
                <li class="flex justify-between items-center">
                    <div>
                        <p class="font-medium">쿠폰 교환</p>
                        <p class="text-sm text-gray-500">${formatDate(coupon.date)}</p>
                    </div>
                    <span class="text-red-500">-200 P</span>
                </li>`;
            pointhistoryEl.insertAdjacentHTML('beforeend', listItem);
        });
    };

    const formatDate = (timestamp) => {
        const date = timestamp.toDate(); // Firestore Timestamp를 JavaScript Date로 변환
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 쿠폰 교환하기 버튼 클릭 이벤트
    exchangeButton.addEventListener('click', async () => {
        const pointData = await getDocumentData('john/point');
        if (pointData.total >= 200) {
            const confirmExchange = confirm('200포인트를 사용하여 1000원 쿠폰으로 교환하시겠습니까?');
            if (confirmExchange) {
                await addDocumentData('john/coupon/coupons', {
                    name: '1,000원',
                    status: 'non-use',
                    desc: '쿠폰 교환',
                    date: Timestamp.now(),
                });
                pointData.total -= 200;
                await updateDocumentData('john/point', { total: pointData.total });
                alert('쿠폰 교환이 완료되었습니다.');
                updatePoints();
                updateCoupons();
                pointhistory();
            }
        } else {
            alert('포인트가 부족합니다.');
        }
    });

    // 쿠폰 목록 토글 버튼
    toggleCouponListButton.addEventListener('click', () => {
        couponListContainer.classList.toggle('hidden');
    });

    // 초기 데이터 로드
    updatePoints();
    updateCoupons();
    pointhistory();
});

// 뒤로가기 버튼 동작 구현
const backButton = document.getElementById("back-button");

backButton.addEventListener("click", () => {
    history.back(); // 브라우저의 뒤로가기 기능 호출
});
