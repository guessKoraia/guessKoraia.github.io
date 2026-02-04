/**
 * Supabase Auth + 권한 체크 (글쓰기 허용, 검토 허용)
 * 스크립트 로드 순서: supabase-config.js → @supabase/supabase-js → supabase-auth.js
 */
(function () {
    var _client = null;
    function getClient() {
        if (typeof supabase === "undefined") return null;
        var url = window.SUPABASE_URL;
        var key = window.SUPABASE_ANON_KEY;
        if (!url || !key) return null;
        if (url === "__SUPABASE_URL__" || key === "__SUPABASE_ANON_KEY__") return null;
        if (String(url).indexOf("__") !== -1 || String(key).indexOf("__") !== -1) return null;
        if (!_client) _client = supabase.createClient(url, key);
        return _client;
    }

    /** OAuth 로그인 (리다이렉트) */
    window.supabaseAuthSignIn = function () {
        var client = getClient();
        if (!client) return Promise.reject(new Error("Supabase 설정이 없습니다. SUPABASE_ANON_KEY를 설정하세요."));
        var redirectTo = location.origin + location.pathname + (location.search || "");
        return client.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: redirectTo }
        }).then(function () {});
    };

    /** 로그아웃 (로컬 세션 제거) */
    window.supabaseAuthSignOut = function () {
        var client = getClient();
        if (!client) return Promise.resolve();
        return client.auth.signOut({ scope: "local" }).then(function () {
            _client = null;
        }).catch(function (err) {
            console.warn("로그아웃 처리:", err);
        });
    };

    /** 현재 세션 조회 (URL hash 처리 포함) */
    window.supabaseAuthGetSession = function () {
        var client = getClient();
        if (!client) return Promise.resolve({ data: { session: null }, error: null });
        return client.auth.getSession();
    };

    /** 세션 변경 시 콜백 (로그인/로그아웃 반영) */
    window.supabaseAuthOnAuthStateChange = function (callback) {
        var client = getClient();
        if (!client) return function () {};
        var sub = client.auth.onAuthStateChange(function (event, session) {
            if (callback) callback(event, session);
        });
        return function () { sub.data.subscription.unsubscribe(); };
    };

    /** 현재 로그인 유저 */
    window.supabaseAuthGetUser = function () {
        var client = getClient();
        if (!client) return Promise.resolve(null);
        return client.auth.getUser().then(function (r) { return r.data.user || null; });
    };

    /** 글쓰기/저장 허용 여부 (allowed_writers에 있으면 true) */
    window.supabaseAuthIsAllowedWriter = function () {
        var client = getClient();
        if (!client) return Promise.resolve(false);
        return client.auth.getUser()
            .then(function (r) {
                var uid = r.data.user?.id;
                if (!uid) return false;
                return client.from("allowed_writers").select("user_id").eq("user_id", uid).maybeSingle();
            })
            .then(function (r) { return !!(r.data && r.data.user_id); });
    };

    /** 검토 목록 전체 조회 허용 여부 (allowed_reviewers에 있으면 true) */
    window.supabaseAuthIsAllowedReviewer = function () {
        var client = getClient();
        if (!client) return Promise.resolve(false);
        return client.auth.getUser()
            .then(function (r) {
                var uid = r.data.user?.id;
                if (!uid) return false;
                return client.from("allowed_reviewers").select("user_id").eq("user_id", uid).maybeSingle();
            })
            .then(function (r) { return !!(r.data && r.data.user_id); });
    };

    /** 내가 작성한 글 목록 (Supabase posts, 최신순) */
    window.supabaseGetMyPosts = function () {
        var client = getClient();
        if (!client) return Promise.resolve([]);
        return client.auth.getUser()
            .then(function (r) {
                var uid = r.data.user?.id;
                if (!uid) return [];
                return client.from("posts").select("*").eq("user_id", uid).order("updated_at", { ascending: false });
            })
            .then(function (r) {
                if (r.error) return [];
                return (r.data || []).map(function (row) { return mapRowToPost(row); });
            });
    };

    /** 검토용 글 목록: 로그인한 사용자는 전체 제출·승인 글 조회 */
    window.supabaseGetPostsForReview = function () {
        var client = getClient();
        if (!client) return Promise.resolve([]);
        return client.auth.getUser().then(function (r) {
            if (!r.data.user) return { data: [] };
            return client.from("posts").select("*").in("status", ["submitted", "approved"]).order("updated_at", { ascending: false });
        }).then(function (r) {
            var data = (r && r.data) ? r.data : (Array.isArray(r) ? r : []);
            return data.map(function (row) {
                return mapRowToPost(row);
            });
        });
    };

    /** 결재 설정 조회 (단계별 허용 이메일, 게시중단 이메일, 이메일→표시명). 저장소에는 이메일 없음, Supabase에서만 관리 */
    window.supabaseGetApprovalConfig = function () {
        var client = getClient();
        if (!client) return Promise.resolve(null);
        return client.from("approval_config").select("value").eq("key", "config").maybeSingle()
            .then(function (r) {
                if (!r.data || !r.data.value) return null;
                return r.data.value;
            });
    };

    function mapRowToPost(row) {
        var history = row.approval_history;
        if (typeof history === "string") try { history = JSON.parse(history); } catch (e) { history = []; }
        if (!Array.isArray(history)) history = [];
        return {
            id: row.id,
            userId: row.user_id,
            type: row.type,
            status: row.status,
            title: row.title,
            authorName: row.author_name,
            date: row.date,
            place: row.place,
            editorHtml: row.editor_html,
            thumbnailUrl: row.thumbnail_url || null,
            updatedAt: row.updated_at,
            createdAt: row.created_at,
            approvalStage: row.approval_stage != null ? row.approval_stage : 0,
            approvalHistory: history
        };
    }

    /** 글 1건 저장 (upsert). 허용된 작성자만 성공함. approval_stage, approval_history, thumbnail_url 옵션. */
    window.supabaseUpsertPost = function (post) {
        var client = getClient();
        if (!client) return Promise.reject(new Error("Supabase 설정이 없습니다."));
        return client.auth.getUser().then(function (r) {
            var uid = r.data.user?.id;
            if (!uid) return Promise.reject(new Error("로그인이 필요합니다."));
            var row = {
                id: post.id,
                user_id: uid,
                type: post.type,
                status: post.status,
                title: post.title || "",
                author_name: post.authorName || "",
                date: post.date || "",
                place: post.place || "",
                editor_html: post.editorHtml || "",
                updated_at: new Date().toISOString()
            };
            if (post.approvalStage != null) row.approval_stage = post.approvalStage;
            if (post.approvalHistory != null) row.approval_history = JSON.stringify(post.approvalHistory);
            // thumbnail_url: 명시적으로 있으면 설정, 없으면 기존 값 유지(덮어쓰기 방지)
            if (post.thumbnailUrl != null && post.thumbnailUrl !== "") {
                row.thumbnail_url = post.thumbnailUrl;
            }
            return client.from("posts").select("thumbnail_url").eq("id", post.id).maybeSingle()
                .then(function (res) {
                    var existing = res && res.data;
                    if (existing && existing.thumbnail_url != null && (row.thumbnail_url == null || row.thumbnail_url === undefined)) {
                        row.thumbnail_url = existing.thumbnail_url;
                    }
                    return client.from("posts").upsert(row, { onConflict: "id" });
                });
        });
    };

    /** 결재 단계 승인: 현재 단계에 작업자명 기록 후 다음 단계로. 5단계 완료 시 status=approved */
    window.supabaseApproveStep = function (postId, approverDisplayName) {
        var client = getClient();
        if (!client) return Promise.reject(new Error("Supabase 설정이 없습니다."));
        var steps = window.APPROVAL_STEPS;
        if (!steps || !steps.length) return Promise.reject(new Error("결재 단계 정의가 없습니다."));
        return client.from("posts").select("approval_stage, approval_history, status").eq("id", postId).maybeSingle()
            .then(function (r) {
                if (!r.data) return Promise.reject(new Error("글을 찾을 수 없습니다."));
                var row = r.data;
                var stage = row.approval_stage != null ? row.approval_stage : 0;
                if (stage >= 5) return Promise.reject(new Error("이미 최종 승인된 글입니다."));
                var history = row.approval_history;
                if (typeof history === "string") try { history = JSON.parse(history); } catch (e) { history = []; }
                if (!Array.isArray(history)) history = [];
                var stepInfo = steps[stage];
                var entry = {
                    step: stage,
                    step_name: stepInfo ? stepInfo.name : "단계 " + stage,
                    approver_name: approverDisplayName || "",
                    approved_at: new Date().toISOString()
                };
                history.push(entry);
                var nextStage = stage + 1;
                var newStatus = nextStage >= 5 ? "approved" : row.status;
                return client.from("posts").update({
                    approval_stage: nextStage,
                    approval_history: history,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                }).eq("id", postId);
            });
    };

    /** 반려: 현재 단계를 이전 단계로 되돌리고 이력에 반려 기록 */
    window.supabaseRejectStep = function (postId, rejectorEmail) {
        var client = getClient();
        if (!client) return Promise.reject(new Error("Supabase 설정이 없습니다."));
        return client.from("posts").select("approval_stage, approval_history").eq("id", postId).maybeSingle()
            .then(function (r) {
                if (!r.data) return Promise.reject(new Error("글을 찾을 수 없습니다."));
                var row = r.data;
                var stage = row.approval_stage != null ? row.approval_stage : 0;
                if (stage <= 0) return Promise.reject(new Error("이미 최초 단계입니다."));
                var history = row.approval_history;
                if (typeof history === "string") try { history = JSON.parse(history); } catch (e) { history = []; }
                if (!Array.isArray(history)) history = [];
                var steps = window.APPROVAL_STEPS;
                var stepInfo = steps && steps[stage] ? steps[stage] : null;
                history.push({
                    step: stage,
                    step_name: stepInfo ? stepInfo.name : "단계 " + stage,
                    rejected: true,
                    approver_name: rejectorEmail || "",
                    approved_at: new Date().toISOString()
                });
                var prevStage = Math.max(0, stage - 1);
                return client.from("posts").update({
                    approval_stage: prevStage,
                    approval_history: history,
                    updated_at: new Date().toISOString()
                }).eq("id", postId);
            });
    };

    /** 게시중단 및 철회: 최종 승인(5단계) 상태를 4단계로 되돌림. 지정된 사용자만 가능(프론트에서 canWithdrawPublish 체크) */
    window.supabaseWithdrawApproval = function (postId) {
        var client = getClient();
        if (!client) return Promise.reject(new Error("Supabase 설정이 없습니다."));
        return client.from("posts").select("approval_stage, approval_history").eq("id", postId).maybeSingle()
            .then(function (r) {
                if (!r.data) return Promise.reject(new Error("글을 찾을 수 없습니다."));
                var row = r.data;
                var stage = row.approval_stage != null ? row.approval_stage : 0;
                if (stage < 5) return Promise.reject(new Error("최종 승인 완료된 글만 게시중단할 수 있습니다."));
                var history = row.approval_history;
                if (typeof history === "string") try { history = JSON.parse(history); } catch (e) { history = []; }
                if (!Array.isArray(history)) history = [];
                var newHistory = history.slice(0, -1);
                newHistory.push({ step: 4, withdrawn: true, approved_at: new Date().toISOString() });
                return client.from("posts").update({
                    approval_stage: 4,
                    status: "submitted",
                    approval_history: newHistory,
                    updated_at: new Date().toISOString()
                }).eq("id", postId);
            });
    };

    /** 글 상태 업데이트 (승인 등) */
    window.supabaseUpdatePostStatus = function (postId, status) {
        var client = getClient();
        if (!client) return Promise.reject(new Error("Supabase 설정이 없습니다."));
        return client.from("posts").update({ status: status, updated_at: new Date().toISOString() }).eq("id", postId);
    };

    /** 글 1건 ID로 조회 (미리보기용) */
    window.supabaseGetPostById = function (id) {
        var client = getClient();
        if (!client) return Promise.resolve(null);
        return client.from("posts").select("*").eq("id", id).maybeSingle().then(function (r) {
            if (!r.data) return null;
            return mapRowToPost(r.data);
        });
    };

    /** 글 삭제 (본인 글만 가능, RLS posts_delete_own) */
    window.supabaseDeletePost = function (postId) {
        var client = getClient();
        if (!client) return Promise.reject(new Error("Supabase 설정이 없습니다."));
        return client.from("posts").delete().eq("id", postId).select().then(function (r) {
            if (r.error) return Promise.reject(r.error);
            return r;
        });
    };

    /** 결재 단계 진행 시 Slack 알림 (Edge Function 호출) */
    window.supabaseInvokeSlackApproval = function (payload) {
        var client = getClient();
        if (!client) return Promise.resolve();
        return client.functions.invoke("send-slack-approval", { body: payload || {} }).then(function (r) {
            if (r.error) console.warn("Slack 알림 실패:", r.error);
            return r;
        });
    };

    /** imgbb API 키 조회 (public.imgbb 테이블의 api 컬럼, 1건) */
    window.supabaseGetImgbbApiKey = function () {
        var url = window.SUPABASE_URL;
        var anonKey = window.SUPABASE_ANON_KEY;

        if (!url || !anonKey) return Promise.resolve(null);
        if (String(url).indexOf("__") !== -1 || String(anonKey).indexOf("__") !== -1) return Promise.resolve(null);

        // 1) supabase-js로 우선 조회 (세션/RLS 대응)
        var client = getClient();
        var tryClientFirst = function () {
            if (!client || !client.from) return Promise.resolve(null);
            var q = (typeof client.schema === "function") ? client.schema("public").from("imgbb") : client.from("imgbb");
            // 테이블에 여러 건이 있을 수 있으니 created_at 최신 1건 사용
            return q
                .select("api,created_at")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle()
                .then(function (r) {
                    if (r && r.data && r.data.api) return r.data.api;
                    return null;
                })
                .catch(function () { return null; });
        };

        // 2) REST 폴백 (응답이 JSON이 아닐 수도 있어 방어적으로 파싱)
        var restUrl = String(url).replace(/\/+$/, "") + "/rest/v1/imgbb?select=api,created_at&order=created_at.desc&limit=1";
        var doFetch = function (token) {
            return fetch(restUrl, {
                headers: {
                    apikey: anonKey,
                    Authorization: "Bearer " + (token || anonKey),
                    Accept: "application/json"
                }
            })
                .then(function (res) {
                    return res.text().then(function (txt) {
                        var json = null;
                        try { json = txt ? JSON.parse(txt) : null; } catch (_) { json = null; }
                        if (!res.ok) return Promise.reject(json || { status: res.status, body: txt });
                        if (Array.isArray(json)) return (json[0] && json[0].api) || null;
                        return (json && json.api) || null;
                    });
                })
                .catch(function () { return null; });
        };

        // RLS가 authenticated-only인 경우를 위해 가능하면 세션 토큰 사용
        return tryClientFirst().then(function (key) {
            if (key) return key;
            if (client && client.auth && typeof client.auth.getSession === "function") {
                return client.auth.getSession()
                    .then(function (s) { return doFetch(s && s.data && s.data.session && s.data.session.access_token); })
                    .catch(function () { return doFetch(null); });
            }
            return doFetch(null);
        });
    };
})();
