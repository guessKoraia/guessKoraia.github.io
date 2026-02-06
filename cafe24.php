<style>
    /* 카드 리스트 가로 배치 */





    .card-text {
        padding: 1rem;
        flex: 1;
        display: flex;
        flex-direction: column;
    }



    .card-text p {
        font-size: 0.9rem;
        line-height: 1.4;
        margin-bottom: 0.5rem;
        flex: 1;
    }



    .card-text span {
        font-size: 0.8rem;
        color: #666;
    }



    .card-text .seminar-title {



        font-weight: 600;
        line-height: 1.4;
        margin-bottom: 0.5rem;
        color: #2d3748;
    }



    .card-text .seminar-info {



        color: #4a5568;
        margin-bottom: 0.3rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }



    .card-text .seminar-info .icon {
        width: 12px;
        height: 12px;
        opacity: 0.7;
    }



    .card-text .seminar-date {



        font-size: 13px;
        color: var(--text-secondary);
        margin-top: auto;
    }
</style>



<script src="https://unpkg.com/@supabase/supabase-js@2"></script>





<section class="grid-item photo-news-section full-width-item">
    <div class="section-header">
        <h3>협회 소식</h3>
        <a href="https://www.koraia.org/default/mp5/sub1.php?sub=01"><button class="plus-btn"
                aria-label="더보기">+</button></a>
    </div>
    <div class="card-list">


<a href="https://www.koraia.org/default/mp5/sub1.php?com_board_basic=read_form&com_board_idx=505&sub=01&&com_board_search_code=&com_board_search_value1=&com_board_search_value2=&com_board_page=&&com_board_id=9&&com_board_id=9"
            class="info-card">
            <img src="https://raw.githubusercontent.com/koraia-trend/koraia-trend.github.io/refs/heads/main/conference/2026011601001295400078151.jpg" alt="AX 국방 리더" loading="lazy">
            <div class="card-text">
                <p>국방 AI 리더스 포럼 출범</p>
                <span>2026.01.15</span>
            </div>
        </a>

<a href="https://www.koraia.org/default/mp5/sub13.php?com_board_basic=read_form&com_board_idx=497&sub=13&&com_board_search_code=&com_board_search_value1=&com_board_search_value2=&com_board_page=&&com_board_id=21&&com_board_id=21"
            class="info-card">
            <img src="https://raw.githubusercontent.com/guessKoraia/guessKoraia.github.io/refs/heads/main/koraia_main_popup/2026-01-07_100033.jpg" alt="알파고 모멘트" loading="lazy">
            <div class="card-text">
                <p>모든 산업들 자기만의 '알파고 모멘트' 올 것</p>
                <span>2026.01.06</span>
            </div>
        </a>


        <a href="https://www.koraia.org/default/mp5/sub1.php?com_board_basic=read_form&com_board_idx=500&sub=01&&com_board_search_code=&com_board_search_value1=&com_board_search_value2=&com_board_page=&&com_board_id=9&&com_board_id=9"
            class="info-card">
            <img src="https://cdn.hansbiz.co.kr/news/photo/202512/796553_799054_418.jpg" alt="국회 정책토론회" loading="lazy">
            <div class="card-text">
                <p>국회 정책토론회, 한국의 AI 경쟁력 도약을 위한 오픈소스 정책 정비</p>
                <span>2025.12.01</span>
            </div>
        </a>


        <a href="https://www.koraia.org/default/mp5/sub1.php?com_board_basic=read_form&com_board_idx=499&sub=01&&com_board_search_code=&com_board_search_value1=&com_board_search_value2=&com_board_page=&&com_board_id=9&&com_board_id=9"
            class="info-card">
            <img src="https://image.inews24.com/v1/e8891cb11d3d49.jpg" alt="천안스마트그린산단, 국가 ‘AX 실증사업’ 선정" loading="lazy">
            <div class="card-text">
                <p>천안스마트그린산단, 국가 ‘AX 실증사업’ 선정</p>
                <span>2025.11.27</span>
            </div>
        </a>


        <a href="https://www.koraia.org/default/mp5/sub1.php?com_board_basic=read_form&com_board_idx=494&sub=01&&com_board_search_code=&com_board_search_value1=&com_board_search_value2=&com_board_page=&&com_board_id=9&&com_board_id=9"
            class="info-card">
            <img src="https://cdn.nbntv.co.kr/news/photo/202509/4010109_277620_256.jpg"
                alt="우리금융, 한국인공지능협회 손잡고 AI산업 동반성장 지원" loading="lazy">
            <div class="card-text">
                <p>우리금융, 한국인공지능협회 손잡고 AI산업 동반성장 지원</p>
                <span>2025.09.30</span>
            </div>
        </a>



    </div>
</section>





<section class="grid-item photo-news-section full-width-item">
    <div class="section-header">
        <h3>국회 AI 세미나 소식</h3>
        <a href="https://report.koraia.org/seminar" target="_blank"><button class="plus-btn"
                aria-label="더보기">+</button></a>
    </div>
    <div id="loading" class="loading">
        <div class="spinner"></div>
        세미나 정보를 불러오는 중...
    </div>
    <div id="error" class="error" style="display: none;"></div>
    <div id="seminars-container" class="card-list" style="display: none;"></div>
    <div id="no-seminars" class="no-seminars" style="display: none;">
        현재 예정된 세미나가 없습니다.
    </div>
</section>



<script>
    // Supabase 설정
    const SUPABASE_URL = 'https://kydkwdwtsqsjxasirxoi.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_8s2AtTlUWOaLtiOvdsH7jQ_t7gVjUCM';


    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



    // DOM 요소들
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const seminarsContainer = document.getElementById('seminars-container');
    const noSeminarsEl = document.getElementById('no-seminars');



    // 오늘 날짜 (YYYY-MM-DD 형식)
    const today = new Date().toISOString().split('T')[0];



    // 세미나 카드 생성 함수 (새로운 구조로)
    function createSeminarCard(seminar) {
        const card = document.createElement('a');
        card.className = 'info-card';
        card.href = seminar.poster_url || seminar.material_link || '#';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';



        const eventDate = new Date(seminar.event_date);
        const formattedDate = eventDate.toISOString().split('T')[0].replace(/-/g, '.');



        card.innerHTML = `
                <img loading="lazy" src="${seminar.poster_url || 'https://placehold.co/300x300?font=roboto&text=KORAIA'}" 
         alt="${seminar.seminar_name}" 
         onerror="this.onerror=null; this.src='https://placehold.co/300x300?font=roboto&text=KORAIA';" >
                <div class="card-text">
                    <div class="seminar-title">${seminar.seminar_name}</div>
                    ${seminar.location ? `
                        <div class="seminar-info">
                            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                            </svg>
                            ${seminar.location}
                        </div>
                    ` : ''}
                    ${seminar.organizer ? `
                        <div class="seminar-info">
                            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                            </svg>
                            ${seminar.organizer}
                        </div>
                    ` : ''}
                    <div class="seminar-date">${formattedDate}</div>
                </div>
            `;



        return card;
    }


// 세미나 데이터 가져오기
async function fetchSeminars() {
    try {
        // 1. UI 초기화
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        seminarsContainer.style.display = 'none';
        noSeminarsEl.style.display = 'none';


        // 2. 날짜 설정 (한국 시간 기준 보정)
        // new Date().toISOString()은 UTC 기준이므로, 한국 시간(KST) 9시간을 더해줍니다.
        const offset = 1000 * 60 * 60 * 9;
        const todayStr = new Date(Date.now() + offset).toISOString().split('T')[0];
        
        const LIMIT = 5;


        // ---------------------------------------------------------
        // 3. 데이터 조회 로직 시작
        // ---------------------------------------------------------


        // [3-1] 미래 데이터 조회 (오늘 포함)
        const { data: futureData, error: futureError } = await supabaseClient 
            .from('ampos_seminar')
            .select('*')
            .eq('is_visible', 1)
            .gte('event_date', todayStr)
            .order('event_date', { ascending: true }) // 가까운 날짜부터
            .limit(LIMIT);


        if (futureError) throw futureError;


        let finalData = [...(futureData || [])];
        const currentCount = finalData.length;


        // [3-2] 부족한 경우 과거 데이터 조회
        if (currentCount < LIMIT) {
            const missingCount = LIMIT - currentCount;


            const { data: pastData, error: pastError } = await supabaseClient 
                .from('ampos_seminar')
                .select('*')
                .eq('is_visible', 1)
                .lt('event_date', todayStr) // 오늘 이전
                .order('event_date', { ascending: false }) // 최신 과거부터 (내림차순)
                .limit(missingCount);


            if (pastError) throw pastError;


            // 과거 데이터(내림차순)를 뒤집어서(오름차순) 앞쪽에 붙임
            // 결과: [오래된 과거 -> 최신 과거 -> 오늘 -> 미래] 순서
            finalData = [...(pastData || []).reverse(), ...finalData];
        }


        // ---------------------------------------------------------
        // 4. 데이터 렌더링
        // ---------------------------------------------------------
        
        loadingEl.style.display = 'none';


        if (finalData && finalData.length > 0) {
            seminarsContainer.style.display = ''; // block 대신 빈 문자열 권장 (CSS display 속성 유지)
            seminarsContainer.innerHTML = '';


            finalData.forEach(seminar => {
                const card = createSeminarCard(seminar);
                seminarsContainer.appendChild(card);
            });
        } else {
            noSeminarsEl.style.display = 'block';
        }


    } catch (error) {
        console.error('세미나 데이터를 가져오는 중 오류 발생:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = `오류가 발생했습니다: ${error.message}`;
    }
}


// 페이지 로드 시 세미나 데이터 가져오기
document.addEventListener('DOMContentLoaded', fetchSeminars);
</script>
<!-- 1.php : AI 트렌드 데일리 블록 (new_04.php 하단에 include) -->
<section class="grid-item photo-news-section full-width-item">
    <div class="section-header ai-news-top">
        <h3>오늘 AI 소식</h3>
        <!-- 제목 오른쪽 컨트롤 -->
        <div class="ai-news__controls">
            <button class="ai-news__btn" id="prevBtn" title="이전 날짜">◀</button>
            <input type="date" id="dateInput" />
            <button class="ai-news__btn primary" id="loadBtn">Load</button>
            <button class="ai-news__btn" id="nextBtn" title="다음 날짜">▶</button>
        </div>
    </div>



    <style>
        :root {
            --ai-card-bg: #ffffff;
            --ai-card-border: #e6e8eb;
            --ai-muted: #6b7280;
            --ai-accent: #175fe6;
            --ai-chip-bg: #f2f6ff;
        }



        /* 헤더 좌우 정렬 */
        .ai-news-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }



        .ai-news {
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
        }


        .ai-news__header {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            align-items: end;
            margin: 0 0 8px 0;
        }


        .ai-news__meta {
            color: var(--ai-muted);
            font-size: 12px;
            margin-top: 2px;
        }



        .ai-news__controls {
            display: flex;
            gap: 6px;
            flex-wrap: nowrap;
            align-items: center;
        }


        .ai-news__controls input[type="date"] {
            padding: 6px 8px;
            border: 1px solid var(--ai-card-border);
            border-radius: 0;
            background: #fff;
            min-width: 130px;
        }


        .ai-news__btn {
            padding: 6px 10px;
            border: 1px solid var(--ai-card-border);
            background: #fff;
            border-radius: 0;
            cursor: pointer;
            font-size: 13px;
        }


        .ai-news__btn.primary {
            background: var(--ai-accent);
            color: #fff;
            border-color: var(--ai-accent);
        }



        /* Tabs */
        .tabs {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            align-items: center;
            border-bottom: 1px solid var(--ai-card-border);
            padding-bottom: 6px;
            margin-bottom: 8px;
        }


        .tab {
            appearance: none;
            background: #f7f8fa;
            color: #374151;
            border: 1px solid var(--ai-card-border);
            border-radius: 0;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 13px;
        }


        .tab.active {
            background: var(--ai-accent);
            color: #fff;
            border-color: var(--ai-accent);
        }


        .tab-panels {
            margin-top: 6px;
        }


        .tab-panel {
            display: none;
        }


        .tab-panel.active {
            display: block;
        }



        /* Card */
        .card {
            background: var(--ai-card-bg);
            border: 1px solid var(--ai-card-border);
            border-radius: 0;
            padding: 12px;
            position: relative;
            overflow: hidden;
        }


        .card__title {
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }


        .card__title .chip {
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 0;
            background: var(--ai-chip-bg);
            color: var(--ai-accent);
        }


        .card ul {
            margin: 0;
            padding-left: 18px;
            display: grid;
            gap: 6px;
        }


        .empty {
            color: var(--ai-muted);
            font-size: 14px;
            padding: 6px 0;
        }


        .loading {
            color: var(--ai-muted);
            font-size: 14px;
        }


        .error {
            color: #b00020;
            font-size: 14px;
            margin-top: 8px;
        }


        .ai-news__footer {
            margin-top: 10px;
            color: var(--ai-muted);
            font-size: 12px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }



        /* 카드 우하단 이미지(흰색 그라데이션 마감) */

.card::before {
    content: "";
    position: absolute;
    /* 위치 조정: 우측 하단에서 적절히 띄움 */
    right: 15px; 
    bottom: 15px;
    
    /* 1. 크기를 64px로 고정 */
    width: 64px;
    height: 64px;
    
    /* 2. 배경 설정 */
    background-image: var(--card-bg-image, url(''));
    background-size: contain;    /* 이미지가 영역 안에서 안 잘리고 다 나오게 함 */
    background-position: center; /* 가운데 정렬 */
    background-repeat: no-repeat;
    
    /* 3. 투명도 및 기타 */
    opacity: 0.8; /* 0.35는 너무 흐릴 수 있어 조금 높였습니다 */
    pointer-events: none;


    /* 4. 마스크 제거 (64px 이미지에서는 마스크가 이미지를 가릴 수 있습니다) */
    -webkit-mask-image: none;
    mask-image: none;
}


        .card>* {
            position: relative;
            z-index: 1;
        }



        /* 요약: 탭 아래에 위치 + 연한 파스텔 블루 */
        .ai-news__summary {
            margin: 12px 0 0;
            font-size: 14px;
            padding: 12px 14px;
            border-radius: 0;
            color: #ffffff;
            background: linear-gradient(135deg, #0542a0 0%, #980000 100%);
            border: 1px solid var(--ai-card-border);
            text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
            font-weight: 600;
        }
    </style>



    <div class="ai-news" id="ai-news">
        <div class="ai-news__header">
            <div class="ai-news__meta" id="meta">최신 데이터를 불러오는 중…</div>
        </div>



        <div class="tabs" role="tablist" aria-label="AI 트렌드 카테고리">
            <button class="tab active" role="tab" aria-selected="true" aria-controls="tab-government"
                id="tab-btn-government">정부 동향</button>
            <button class="tab" role="tab" aria-selected="false" aria-controls="tab-domestic" id="tab-btn-domestic">국내
                동향</button>
            <button class="tab" role="tab" aria-selected="false" aria-controls="tab-global" id="tab-btn-global">해외
                동향</button>
            <button class="tab" role="tab" aria-selected="false" aria-controls="tab-corporate" id="tab-btn-corporate">기업
                동향</button>
        </div>



        <div class="tab-panels">
            <section class="tab-panel active" id="tab-government" role="tabpanel" aria-labelledby="tab-btn-government">
                <article class="card" style="--card-bg-image: url('https://cdn-icons-png.flaticon.com/128/149/149264.png');">
                    <div class="card__title">정부 동향 <span class="chip">Gov</span></div>
                    <ul id="governmentList">
                        <li class="loading">불러오는 중…</li>
                    </ul>
                </article>
            </section>



            <section class="tab-panel" id="tab-domestic" role="tabpanel" aria-labelledby="tab-btn-domestic">
                <article class="card" style="--card-bg-image: url('https://cdn-icons-png.flaticon.com/128/149/149226.png');">
                    <div class="card__title">국내 동향 <span class="chip">Domestic</span></div>
                    <ul id="domesticList">
                        <li class="loading">불러오는 중…</li>
                    </ul>
                </article>
            </section>



            <section class="tab-panel" id="tab-global" role="tabpanel" aria-labelledby="tab-btn-global">
                <article class="card" style="--card-bg-image: url('https://cdn-icons-png.flaticon.com/128/149/149229.png');">
                    <div class="card__title">해외 동향 <span class="chip">Global</span></div>
                    <ul id="globalList">
                        <li class="loading">불러오는 중…</li>
                    </ul>
                </article>
            </section>



            <section class="tab-panel" id="tab-corporate" role="tabpanel" aria-labelledby="tab-btn-corporate">
                <article class="card" style="--card-bg-image: url('https://cdn-icons-png.flaticon.com/128/149/149238.png');">
                    <div class="card__title">기업 동향 <span class="chip">Corporate</span></div>
                    <ul id="corporateList">
                        <li class="loading">불러오는 중…</li>
                    </ul>
                </article>
            </section>
        </div>



        <!-- 요약을 탭 아래로 이동 -->
        <blockquote class="ai-news__summary" id="summary">요약을 불러오는 중…</blockquote>



        <div class="ai-news__footer" id="footerMeta"></div>
        <div class="error" id="errorBox" style="display:none;"></div>
    </div>



    <script>
        // 전역 SUPABASE_URL, SUPABASE_ANON_KEY가 이미 로드되어 있다고 가정 (new_04.php 상단)
        (function () {
            const supabaseNews = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



            const els = {
                meta: document.getElementById('meta'),
                footerMeta: document.getElementById('footerMeta'),
                summary: document.getElementById('summary'),
                dateInput: document.getElementById('dateInput'),
                prevBtn: document.getElementById('prevBtn'),
                nextBtn: document.getElementById('nextBtn'),
                loadBtn: document.getElementById('loadBtn'),
                lists: {
                    domestic: document.getElementById('domesticList'),
                    global: document.getElementById('globalList'),
                    government: document.getElementById('governmentList'),
                    corporate: document.getElementById('corporateList'),
                },
                error: document.getElementById('errorBox'),
            };



            function renderList(ul, items) {
                ul.innerHTML = '';
                if (!items || items.length === 0) {
                    ul.innerHTML = '<li class="empty">데이터가 없습니다.</li>';
                    return;
                }
                const frag = document.createDocumentFragment();
                items.forEach(text => {
                    const li = document.createElement('li');
                    li.textContent = text;
                    frag.appendChild(li);
                });
                ul.appendChild(frag);
            }



            function setLoading() {
                els.summary.textContent = '요약을 불러오는 중…';
                Object.values(els.lists).forEach(ul => ul.innerHTML = '<li class="loading">불러오는 중…</li>');
                els.error.style.display = 'none';
                els.error.textContent = '';
            }



            function setError(msg) {
                els.error.style.display = 'block';
                els.error.textContent = msg || '데이터를 불러오지 못했습니다.';
            }



            async function fetchLatest() {
                const { data, error } = await supabaseNews
                    .from('ai_news_daily')
                    .select('news_date,version,key_summary,domestic_insights,global_insights,government_insights,corporate_insights,created_at,updated_at')
                    .order('news_date', { ascending: false })
                    .order('version', { ascending: false })
                    .limit(1);
                if (error) throw error;
                return data?.[0] || null;
            }



            async function fetchByDate(dateStr) {
                const { data, error } = await supabaseNews
                    .from('ai_news_daily')
                    .select('news_date,version,key_summary,domestic_insights,global_insights,government_insights,corporate_insights,created_at,updated_at')
                    .eq('news_date', dateStr)
                    .order('version', { ascending: false })
                    .limit(1);
                if (error) throw error;
                return data?.[0] || null;
            }



            async function findPrevDate(currentDate) {
                const { data, error } = await supabaseNews
                    .from('ai_news_daily').select('news_date')
                    .lt('news_date', currentDate)
                    .order('news_date', { ascending: false }).limit(1);
                if (error) return null;
                return data?.[0]?.news_date || null;
            }



            async function findNextDate(currentDate) {
                const { data, error } = await supabaseNews
                    .from('ai_news_daily').select('news_date')
                    .gt('news_date', currentDate)
                    .order('news_date', { ascending: true }).limit(1);
                if (error) return null;
                return data?.[0]?.news_date || null;
            }



            function renderNews(row) {
                if (!row) {
                    els.meta.textContent = '데이터가 없습니다.';
                    els.summary.textContent = '';
                    Object.values(els.lists).forEach(ul => ul.innerHTML = '<li class="empty">데이터가 없습니다.</li>');
                    els.footerMeta.textContent = '';
                    return;
                }
                const d = row.news_date;
                els.meta.textContent = ``;
                els.summary.textContent = row.key_summary || '요약 없음';



                renderList(els.lists.domestic, row.domestic_insights);
                renderList(els.lists.global, row.global_insights);
                renderList(els.lists.government, row.government_insights);
                renderList(els.lists.corporate, row.corporate_insights);



                const updated = row.updated_at ? new Date(row.updated_at).toLocaleString() : '';
                els.footerMeta.textContent = updated ? `게시일: ${updated}` : '';
                els.dateInput.value = d;
            }



            async function loadLatest() {
                setLoading();
                try {
                    const row = await fetchLatest();
                    renderNews(row);
                    wirePrevNext(row?.news_date);
                } catch (e) { setError(e.message || String(e)); }
            }



            async function loadByDate(dateStr) {
                setLoading();
                try {
                    const row = await fetchByDate(dateStr);
                    renderNews(row);
                    wirePrevNext(row ? row.news_date : dateStr);
                } catch (e) { setError(e.message || String(e)); }
            }



            async function wirePrevNext(currentDate) {
                const [prev, next] = await Promise.all([findPrevDate(currentDate), findNextDate(currentDate)]);
                els.prevBtn.disabled = !prev; els.nextBtn.disabled = !next;
                els.prevBtn.dataset.target = prev || ''; els.nextBtn.dataset.target = next || '';
            }



            // 탭 전환
            (function setupTabs() {
                const tabs = Array.from(document.querySelectorAll('.tab'));
                const panels = Array.from(document.querySelectorAll('.tab-panel'));
                function activate(id) {
                    tabs.forEach(t => {
                        const isActive = t.getAttribute('aria-controls') === id;
                        t.classList.toggle('active', isActive);
                        t.setAttribute('aria-selected', String(isActive));
                    });
                    panels.forEach(p => p.classList.toggle('active', p.id === id));
                }
                tabs.forEach(t => t.addEventListener('click', () => activate(t.getAttribute('aria-controls'))));
                activate('tab-government'); // 기본: 정부 동향
            })();



            // 컨트롤
            els.loadBtn.addEventListener('click', () => { const v = els.dateInput.value; if (v) loadByDate(v); });
            els.prevBtn.addEventListener('click', () => { const t = els.prevBtn.dataset.target; if (t) loadByDate(t); });
            els.nextBtn.addEventListener('click', () => { const t = els.nextBtn.dataset.target; if (t) loadByDate(t); });



            // 최초 로드
            loadLatest();
        })();
    </script>
</section>