import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildCoachPrompt, generateRuleBasedInsights } from "../utils/coachHelpers.js";
import { findRecentInsight, createInsight } from "../repositories/aiCoach.repository.js";
import { computeUserAnalytics, getContestAnalytics, getTopicAnalytics } from "./analytics.service.js";

// GEMINI INIT
let genAI = null;
try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch {
    // Gemini unavailable — rule-based fallback will be used
}

// CACHE DURATIONS (hours)
const CACHE_HOURS = {
    DAILY:          12,
    WEEKLY:         72,
    MONTHLY:        168,
    CONTEST_REVIEW: 24,
    STUDY_PLAN:     48,
};

// CALL GEMINI
const callGemini = async (prompt) => {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch {
        return null;
    }
};

// BUILD ENRICHED ANALYTICS
const buildEnrichedAnalytics = async (userId) => {
    const [base, contestData, topicData] = await Promise.all([
        computeUserAnalytics(userId),
        getContestAnalytics(userId),
        getTopicAnalytics(userId),
    ]);

    return {
        ...base,
        contestAnalytics: contestData,
        topicStats:       topicData.topics,
    };
};

// GENERATE INSIGHT
const generateInsight = async (userId, insightType, forceRefresh = false) => {
    const cacheHours = CACHE_HOURS[insightType] || 24;

    // CHECK CACHE
    if (!forceRefresh) {
        const cached = await findRecentInsight(userId, insightType, cacheHours);
        if (cached) return { insight: cached, fromCache: true };
    }

    // BUILD ANALYTICS
    const analytics = await buildEnrichedAnalytics(userId);

    // CALL AI — fallback to rule-based if Gemini fails
    const prompt = buildCoachPrompt(insightType.toLowerCase(), analytics);
    let insightText = await callGemini(prompt);

    if (!insightText) {
        insightText = generateRuleBasedInsights(analytics).join("\n\n");
    }

    // SAVE TO DB
    const insight = await createInsight({
        userId,
        insightType,
        analyticsSnapshot: analytics,
        insightText,
        weakTopics:   analytics.weakTopics   || [],
        strongTopics: analytics.strongTopics || [],
    });

    return { insight, fromCache: false };
};

// PUBLIC API
export const generateDailySummary = (userId, forceRefresh = false) =>
    generateInsight(userId, "DAILY", forceRefresh);

export const generateCoachingInsight = async (analytics) => {
    const text = await callGemini(buildCoachPrompt("daily", analytics));
    return text ?? generateRuleBasedInsights(analytics).join("\n\n");
};

export const generateWeeklyReport = (userId, forceRefresh = false) =>
    generateInsight(userId, "WEEKLY", forceRefresh);

export const generateMonthlyReport = (userId, forceRefresh = false) =>
    generateInsight(userId, "MONTHLY", forceRefresh);

export const generateStudyPlan = (userId, forceRefresh = false) =>
    generateInsight(userId, "STUDY_PLAN", forceRefresh);

export const generateContestReview = (userId, forceRefresh = false) =>
    generateInsight(userId, "CONTEST_REVIEW", forceRefresh);
