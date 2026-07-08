import { GoogleGenerativeAI } from "@google/generative-ai";
import ApiError from "../utils/ApiError.js";
import { buildCoachPrompt, generateRuleBasedInsights } from "../utils/coachHelpers.js";
import { findRecentInsight, createInsight } from "../repositories/aiCoach.repository.js";
import { computeUserAnalytics, getContestAnalytics, getTopicAnalytics } from "./analytics.service.js";

// ─────────────────────────────────────────────
// SYSTEM 3 — AI COACH
//
// Takes System 2's computed analytics and generates
// personalized coaching insights. Uses Gemini when
// available, with rule-based fallback.
//
// Supports different insight types:
//   DAILY, WEEKLY, MONTHLY, CONTEST_REVIEW, STUDY_PLAN
// ─────────────────────────────────────────────

let genAI = null;
try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch {
    // Gemini will be unavailable — rule-based fallback will be used
}

// ─────── Cache durations per type (in hours) ───────

const CACHE_HOURS = {
    DAILY:          12,
    WEEKLY:         72,   // 3 days
    MONTHLY:        168,  // 7 days
    CONTEST_REVIEW: 24,
    STUDY_PLAN:     48,
};

// ─────── Core Gemini call ───────

const callGemini = async (prompt) => {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text.trim();
    } catch {
        return null; // fall back to rule-based
    }
};

// ─────── Build enriched analytics for prompts ───────

const buildEnrichedAnalytics = async (userId) => {
    const [base, contestData, topicData] = await Promise.all([
        computeUserAnalytics(userId),
        getContestAnalytics(userId),
        getTopicAnalytics(userId),
    ]);

    return {
        ...base,
        contestAnalytics: contestData,
        topicStats: topicData.topics,
    };
};

// ─────── Generic insight generator ───────

const generateInsight = async (userId, insightType, forceRefresh = false) => {
    const cacheHours = CACHE_HOURS[insightType] || 24;

    // Check cache first
    if (!forceRefresh) {
        const cached = await findRecentInsight(userId, insightType, cacheHours);
        if (cached) {
            return { insight: cached, fromCache: true };
        }
    }

    // Build analytics
    const analytics = await buildEnrichedAnalytics(userId);

    // Try Gemini first, fall back to rules
    const promptType = insightType.toLowerCase();
    const prompt = buildCoachPrompt(promptType, analytics);
    let insightText = await callGemini(prompt);

    if (!insightText) {
        // Rule-based fallback
        const ruleInsights = generateRuleBasedInsights(analytics);
        insightText = ruleInsights.join("\n\n");
    }

    // Extract weak/strong topics from enriched analytics
    const weakTopics   = analytics.weakTopics   || [];
    const strongTopics = analytics.strongTopics || [];

    // Save to DB
    const insight = await createInsight({
        userId,
        insightType,
        analyticsSnapshot: analytics,
        insightText,
        weakTopics,
        strongTopics,
    });

    return { insight, fromCache: false };
};

// ─────────────────────────────────────────────
// PUBLIC API — used by controllers
// ─────────────────────────────────────────────

/**
 * Daily summary — quick actionable feedback.
 * Preserved compatibility with existing getCoachInsight behavior.
 */
export const generateDailySummary = async (userId, forceRefresh = false) => {
    return generateInsight(userId, "DAILY", forceRefresh);
};

/**
 * Alias for the existing controller — backwards-compatible.
 */
export const generateCoachingInsight = async (analytics) => {
    const prompt = buildCoachPrompt("daily", analytics);
    const text = await callGemini(prompt);

    if (text) return text;

    // Rule-based fallback
    return generateRuleBasedInsights(analytics).join("\n\n");
};

/**
 * Weekly coaching report.
 */
export const generateWeeklyReport = async (userId, forceRefresh = false) => {
    return generateInsight(userId, "WEEKLY", forceRefresh);
};

/**
 * Monthly deep-dive report.
 */
export const generateMonthlyReport = async (userId, forceRefresh = false) => {
    return generateInsight(userId, "MONTHLY", forceRefresh);
};

/**
 * Structured study plan.
 */
export const generateStudyPlan = async (userId, forceRefresh = false) => {
    return generateInsight(userId, "STUDY_PLAN", forceRefresh);
};

/**
 * Post-contest review.
 */
export const generateContestReview = async (userId, forceRefresh = false) => {
    return generateInsight(userId, "CONTEST_REVIEW", forceRefresh);
};
