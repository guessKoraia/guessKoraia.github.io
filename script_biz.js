// 전역 변수
let currentPage = 0;
let currentSize = 20;
let totalElements = 0;
let totalPages = 0;
let currentData = [];

// DOM 요소들
const announcementsList = document.getElementById('announcementsList');
const pagination = document.getElementById('pagination');
const loadingSpinner = document.getElementById('loadingSpinner');
const totalCount = document.getElementById('totalCount');
const currentPageSpan = document.getElementById('currentPage');
const excelDownloadBtn = document.getElementById('excelDownloadBtn');
const sourceInfoBtn = document.getElementById('sourceInfoBtn');
const sourceModal = document.getElementById('sourceModal');
const modalClose = document.querySelector('.close');

// API 기본 URL
const API_BASE_URL = 'https://127.0.0.1:5555/items/biz/paging';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadAnnouncements();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 엑셀 다운로드 버튼
    excelDownloadBtn.addEventListener('click', function() {
        downloadExcel();
    });

    // 소스 정보 버튼
    sourceInfoBtn.addEventListener('click', function() {
        sourceModal.style.display = 'block';
    });

    // 모달 닫기 버튼
    modalClose.addEventListener('click', function() {
        sourceModal.style.display = 'none';
    });

    // 모달 외부 클릭시 닫기
    window.addEventListener('click', function(event) {
        if (event.target === sourceModal) {
            sourceModal.style.display = 'none';
        }
    });
}

// API에서 공고 데이터 로드
async function loadAnnouncements() {
    showLoading(true);
    
    try {
        const params = new URLSearchParams({
            page: currentPage,
            size: currentSize
        });

        const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        currentData = data.content || [];
        totalElements = data.totalElements || 0;
        totalPages = data.totalPages || 0;
        currentPage = data.page || 0;

        displayAnnouncements();
        updatePagination();
        updateResultInfo();

    } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
        showErrorMessage('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        showLoading(false);
    }
}

// 공고 목록 표시
function displayAnnouncements() {
    if (currentData.length === 0) {
        announcementsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어나 필터를 사용해보세요.</p>
            </div>
        `;
        return;
    }

    const announcementsHTML = currentData.map(item => `
        <div class="announcement-item">
            <div class="announcement-header">
                <a href="${item.url}" target="_blank" class="announcement-title-link">
                    <h3 class="announcement-title">${escapeHtml(item.bizName)}</h3>
                </a>
                <span class="announcement-date">${formatDate(item.date)}</span>
            </div>
            <div class="announcement-org">
                <i class="fas fa-building"></i>
                ${escapeHtml(item.biz)}
            </div>
        </div>
    `).join('');

    announcementsList.innerHTML = announcementsHTML;
}

// 페이지네이션 업데이트
function updatePagination() {
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    let paginationHTML = '';

    // 이전 버튼
    paginationHTML += `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // 첫 페이지
    if (startPage > 0) {
        paginationHTML += `<button onclick="goToPage(0)">1</button>`;
        if (startPage > 1) {
            paginationHTML += `<span>...</span>`;
        }
    }

    // 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="goToPage(${i})" ${i === currentPage ? 'class="active"' : ''}>
                ${i + 1}
            </button>
        `;
    }

    // 마지막 페이지
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += `<button onclick="goToPage(${totalPages - 1})">${totalPages}</button>`;
    }

    // 다음 버튼
    paginationHTML += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages - 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// 특정 페이지로 이동
function goToPage(page) {
    if (page >= 0 && page < totalPages) {
        currentPage = page;
        loadAnnouncements();
    }
}

// 결과 정보 업데이트
function updateResultInfo() {
    totalCount.textContent = `총 ${totalElements.toLocaleString()}건`;
    currentPageSpan.textContent = `페이지 ${currentPage + 1}`;
}

// 로딩 상태 표시/숨김
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
    announcementsList.style.display = show ? 'none' : 'block';
}

// 에러 메시지 표시
function showErrorMessage(message) {
    announcementsList.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>오류가 발생했습니다</h3>
            <p>${message}</p>
            <button onclick="loadAnnouncements()" class="retry-btn">
                <i class="fas fa-redo"></i>
                다시 시도
            </button>
        </div>
    `;
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 날짜 포맷팅 함수
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '오늘';
    } else if (diffDays === 2) {
        return '어제';
    } else if (diffDays <= 7) {
        return `${diffDays - 1}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

// 엑셀 다운로드 함수 (10페이지 분량)
async function downloadExcel() {
    try {
        excelDownloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 다운로드 중...';
        excelDownloadBtn.disabled = true;

        const allData = [];
        const maxPages = 10;
        const itemsPerPage = 20;


        for (let page = 0; page < maxPages; page++) {
            const progress = Math.round(((page + 1) / maxPages) * 100);
            excelDownloadBtn.innerHTML = `<i class=\"fas fa-spinner fa-spin\"></i> 다운로드 중... ${progress}%`;

            const params = new URLSearchParams({
                page: page,
                size: itemsPerPage
            });

            try {
                const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const pageData = data.content || [];
                    if (pageData.length > 0) {
                        allData.push(...pageData);
                    } else {
                        break;
                    }
                    if (page >= (data.totalPages - 1)) {
                        break;
                    }
                } else {
                    break;
                }
            } catch (pageError) {
                break;
            }
        }

        if (allData.length === 0) {
            alert('다운로드할 데이터가 없습니다.');
            return;
        }

        const csvContent = generateCSV(allData);
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `사업공고_${allData.length}건_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('엑셀 다운로드 중 오류 발생:', error);
        alert('엑셀 다운로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        excelDownloadBtn.innerHTML = '<i class="fas fa-file-excel"></i> 엑셀 다운로드';
        excelDownloadBtn.disabled = false;
    }
}

// CSV 데이터 생성 함수
function generateCSV(data) {
    const headers = ['번호', '기관명', '공고명', 'URL', '날짜'];
    const rows = data.map((item, index) => [
        index + 1,
        item.biz || '',
        item.bizName || '',
        item.url || '',
        item.date || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

// CSS 스타일 추가 (에러 메시지 및 로딩 스타일)
const additionalStyles = `
    .no-results, .error-message {
        text-align: center;
        padding: 50px 20px;
        color: #666;
        background: #f9f9f9;
        border-radius: 8px;
        border: 1px solid #e8e8e8;
    }
    
    .no-results i, .error-message i {
        font-size: 40px;
        color: #ccc;
        margin-bottom: 15px;
    }
    
    .no-results h3, .error-message h3 {
        margin-bottom: 8px;
        color: #2c3e50;
        font-size: 18px;
    }
    
    .no-results p, .error-message p {
        color: #666;
        font-size: 14px;
    }
    
    .retry-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 8px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        margin-top: 15px;
        transition: all 0.2s ease;
    }
    
    .retry-btn:hover {
        background: #45a049;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
    }
    
    .pagination span {
        padding: 8px 12px;
        color: #666;
        font-size: 13px;
    }
    
    .announcement-item:nth-child(even) {
        background: #fafafa;
    }
    
    .announcement-item:hover {
        background: white;
    }
`;

// 스타일 추가
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);