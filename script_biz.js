// 전역 변수
let currentPage = 0;
let currentSize = 20;
let totalElements = 0;
let totalPages = 0;
let currentData = [];
let currentKeyword = '';

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
// 검색 관련 DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const searchState = document.getElementById('searchState');

// API 기본 URL
// 목록 페이지네이션 전용 (키워드 없을 때)
const API_PAGING_URL = 'https://startups.koraia.org:5555/items/biz/paging';
// 검색 전용 (Spring Boot 제공 @GetMapping("/items/biz/search"))
const API_SEARCH_URL = 'https://startups.koraia.org:5555/items/biz/search';
// 향후 organization / dateRange 확장 대비 변수 (지금은 UI 없음)
let currentOrganization = '';
let currentDateRange = '';

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
    if (sourceInfoBtn && sourceModal) {
        sourceInfoBtn.addEventListener('click', function() {
            sourceModal.style.display = 'block';
        });
    }

    // 모달 닫기 버튼
    if (modalClose && sourceModal) {
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

    // 검색 버튼
    if (searchBtn) {
        searchBtn.addEventListener('click', triggerSearch);
    }

    // 검색 인풋 Enter 처리
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                triggerSearch();
            }
        });
    }

    // 취소 버튼
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            currentKeyword = '';
            if (searchInput) searchInput.value = '';
            clearBtn.style.display = 'none';
            updateSearchState();
            currentPage = 0;
            loadAnnouncements();
        });
    }

    // 초기 URL의 keyword 파라미터 처리
    const params = new URLSearchParams(window.location.search);
    const initKeyword = params.get('keyword');
    if (initKeyword) {
        currentKeyword = initKeyword.trim();
        if (searchInput) searchInput.value = currentKeyword;
        clearBtn.style.display = 'inline-flex';
        updateSearchState();
    }
}

// API에서 공고 데이터 로드
async function loadAnnouncements() {
    showLoading(true);
    
    try {
        const params = new URLSearchParams({ page: currentPage, size: currentSize });
        let endpoint = API_PAGING_URL;
        if (currentKeyword) {
            endpoint = API_SEARCH_URL;
            params.append('keyword', currentKeyword);
        }
        if (currentOrganization) params.append('organization', currentOrganization);
        if (currentDateRange) params.append('dateRange', currentDateRange);

        let response = await fetch(`${endpoint}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // 검색 엔드포인트가 아직 서버에 반영되지 않은 경우(404 등) fallback
        if (!response.ok && currentKeyword && response.status === 404) {
            endpoint = API_PAGING_URL;
            response = await fetch(`${endpoint}?${params.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
        }

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

    const startNumber = totalElements - (currentPage * currentSize);
    const announcementsHTML = currentData.map((item, idx) => {
        const label = formatDate(item.date);
        const isToday = label === '오늘';
        const todayBadge = isToday ? '<span class="today-badge"></span>' : '';
        const number = startNumber - idx;
        return `
            <div class="board-row ${isToday ? 'today' : ''}">
                <div class="board-col-number">${number}</div>
                <div class="board-col-org">${escapeHtml(item.biz)}</div>
                <div class="board-col-title"><a href="${item.url}" target="_blank">${escapeHtml(item.bizName)} ${todayBadge}</a></div>
                <div class="board-col-date ${isToday ? 'today' : ''}">${label}</div>
            </div>`;
    }).join('');

    announcementsList.innerHTML = announcementsHTML;
}

// 페이지네이션 업데이트
function updatePagination() {
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    const isMobile = window.innerWidth <= 768;
    const maxVisiblePages = isMobile ? 3 : 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    let paginationHTML = '';

    // 이전 버튼
    paginationHTML += `
        <button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    if (isMobile) {
        // 모바일: 첫/마지막만 별도 처리, 가운데 최대 3개
        if (startPage > 0) {
            paginationHTML += `<button class="page-btn" onclick="goToPage(0)">1</button>`;
            if (startPage > 1) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                    ${i + 1}
                </button>
            `;
        }

        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-btn ${totalPages - 1 === currentPage ? 'active' : ''}" onclick="goToPage(${totalPages - 1})">${totalPages}</button>`;
        }
    } else {
        // 데스크톱: 기존 방식 유지
        if (startPage > 0) {
            paginationHTML += `<button class="page-btn" onclick="goToPage(0)">1</button>`;
            if (startPage > 1) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                    ${i + 1}
                </button>
            `;
        }

        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-btn ${totalPages - 1 === currentPage ? 'active' : ''}" onclick="goToPage(${totalPages - 1})">${totalPages}</button>`;
        }
    }

    // 다음 버튼
    paginationHTML += `
        <button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages - 1 ? 'disabled' : ''}>
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
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// 결과 정보 업데이트
function updateResultInfo() {
    if (totalCount) {
        totalCount.textContent = totalElements.toLocaleString();
    }
    if (currentPageSpan) {
        currentPageSpan.textContent = (currentPage + 1).toLocaleString();
    }
}

// 검색 실행
function triggerSearch() {
    const kw = (searchInput?.value || '').trim();
    if (kw === currentKeyword) return; // 변화 없으면 무시
    currentKeyword = kw;
    currentPage = 0;
    if (currentKeyword) {
        clearBtn.style.display = 'inline-flex';
    } else {
        clearBtn.style.display = 'none';
    }
    updateSearchState();
    // URL 쿼리 업데이트 (history push)
    const newParams = new URLSearchParams(window.location.search);
    if (currentKeyword) {
        newParams.set('keyword', currentKeyword);
    } else {
        newParams.delete('keyword');
    }
    const newUrl = `${window.location.pathname}?${newParams.toString()}`.replace(/\?$/, '');
    window.history.replaceState({}, '', newUrl);
    loadAnnouncements();
}

function updateSearchState() {
    if (!searchState) return;
    if (currentKeyword) {
        searchState.style.display = 'inline-flex';
        searchState.className = 'search-active-badge';
        searchState.innerHTML = `<i class="fas fa-filter"></i> "${escapeHtml(currentKeyword)}" 검색중`;
    } else {
        searchState.style.display = 'none';
        searchState.textContent = '';
    }
}

// 로딩 상태 표시/숨김
function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
    if (announcementsList) {
        announcementsList.style.display = show ? 'none' : 'block';
    }
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
            const params = new URLSearchParams({ page: page, size: itemsPerPage });
            let endpoint = API_PAGING_URL;
            if (currentKeyword) {
                endpoint = API_SEARCH_URL;
                params.append('keyword', currentKeyword);
            }
            if (currentOrganization) params.append('organization', currentOrganization);
            if (currentDateRange) params.append('dateRange', currentDateRange);

            try {
                let response = await fetch(`${endpoint}?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok && currentKeyword && response.status === 404) {
                    // fallback
                    endpoint = API_PAGING_URL;
                    response = await fetch(`${endpoint}?${params.toString()}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
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

// 화면 크기 변경 시 페이지네이션 재렌더링 (디바운스)
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (totalPages > 1) {
            updatePagination();
        }
    }, 250);
});
