/**
 * 결재 라인 정의 (민감 정보 없음)
 * 단계명·담당자·허용 이메일·이메일→표시명은 모두 Supabase approval_config에서 로드
 */

/** 이메일 → 표시명 (Supabase config 로드 전에는 빈 객체, initApprovalConfig에서 채움) */
window.EMAIL_TO_NAME = {};

/** 이메일을 표시명으로 변환. 매핑 없으면 "결재자" 반환 (이메일 노출 방지) */
window.getNameByEmail = function (email) {
    if (!email || typeof email !== "string") return "결재자";
    var normalizedEmail = email.trim().toLowerCase();
    var name = window.EMAIL_TO_NAME[normalizedEmail];
    return name || "결재자";
};

/** 단계 구조만 저장소에 둠. name/responsible/allowedEmails는 approval_config에서 로드 */
window.APPROVAL_STEPS = [
    { step: 0, name: "단계 0", responsible: "", allowedEmails: [] },
    { step: 1, name: "단계 1", responsible: "", allowedEmails: [] },
    { step: 2, name: "단계 2", responsible: "", allowedEmails: [] },
    { step: 3, name: "단계 3", responsible: "", allowedEmails: [] },
    { step: 4, name: "단계 4", responsible: "", allowedEmails: [] }
];

/** Supabase approval_config 로드 후 호출. steps의 name, responsible, allowedEmails와 emailToName, withdrawEmails 반영 */
window.initApprovalConfig = function (config) {
    if (!config || typeof config !== "object") return;
    var steps = config.steps;
    if (Array.isArray(steps)) {
        steps.forEach(function (s) {
            var step = window.APPROVAL_STEPS[s.step];
            if (!step) return;
            if (typeof s.name === "string") step.name = s.name;
            if (typeof s.responsible === "string") step.responsible = s.responsible;
            if (Array.isArray(s.allowedEmails)) step.allowedEmails = s.allowedEmails;
        });
    }
    if (config.withdrawEmails && Array.isArray(config.withdrawEmails)) {
        window.WITHDRAW_ALLOWED_EMAILS = config.withdrawEmails.slice();
    }
    if (config.emailToName && typeof config.emailToName === "object") {
        window.EMAIL_TO_NAME = {};
        Object.keys(config.emailToName).forEach(function (email) {
            window.EMAIL_TO_NAME[email.trim().toLowerCase()] = config.emailToName[email];
        });
    }
};

/** 게시중단 허용 이메일 (initApprovalConfig에서 채움) */
window.WITHDRAW_ALLOWED_EMAILS = [];

window.getApprovalStepInfo = function (stage) {
    return window.APPROVAL_STEPS[stage] || null;
};

/** 최종 승인까지 완료된 상태: approval_stage가 5 이상(마지막 단계 승인 후) */
window.isApprovalComplete = function (stage) {
    return stage >= 5;
};

window.canWithdrawPublish = function (userEmail) {
    if (!userEmail || typeof userEmail !== "string") return false;
    var list = window.WITHDRAW_ALLOWED_EMAILS;
    if (!Array.isArray(list) || list.length === 0) return false;
    var normalized = userEmail.trim().toLowerCase();
    return list.some(function (e) { return String(e).trim().toLowerCase() === normalized; });
};

/** 해당 단계를 승인할 수 있는 이메일인지 확인 */
window.canApproveStep = function (stage, userEmail) {
    if (!userEmail || typeof userEmail !== "string") return false;
    var stepInfo = window.APPROVAL_STEPS[stage];
    if (!stepInfo) return false;
    var emails = stepInfo.allowedEmails || (stepInfo.allowedEmail ? [stepInfo.allowedEmail] : []);
    if (emails.length === 0) return false;
    var normalizedUserEmail = userEmail.trim().toLowerCase();
    return emails.some(function (email) {
        return String(email).trim().toLowerCase() === normalizedUserEmail;
    });
};

/** 결재가 진행중인지 확인 (step 1 이상) */
window.isApprovalInProgress = function (stage) {
    return stage >= 1 && stage < 5;
};

/** 해당 단계의 결재자(수정권한자)인지 확인 */
window.canEditAtStage = function (stage, userEmail, authorEmail, status) {
    if (!userEmail || typeof userEmail !== "string") return false;
    var normalizedUserEmail = userEmail.trim().toLowerCase();

    if (status === "rejected") {
        if (stage === 0) {
            return !!(authorEmail && authorEmail.trim().toLowerCase() === normalizedUserEmail);
        }
        return window.canApproveStep(stage, userEmail);
    }

    if (status === "draft" && (!stage || stage === 0)) {
        if (authorEmail && authorEmail.trim().toLowerCase() === normalizedUserEmail) {
            return true;
        }
        return false;
    }

    if (status === "submitted" || window.isApprovalInProgress(stage)) {
        return window.canApproveStep(stage, userEmail);
    }

    return false;
};
