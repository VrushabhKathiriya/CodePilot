// RULE-BASED INSIGHTS
export const generateRuleBasedInsights = (analytics) => {
    const insights = [];
    const { perPlatform, totals, topicStats, weakTopics, strongTopics, contestAnalytics } = analytics;

    if (strongTopics && strongTopics.length > 0) {
        insights.push(`Your ${strongTopics[0]} skills are excellent — keep pushing to harder problems in this area.`);
    }

    if (weakTopics && weakTopics.length > 0) {
        insights.push(`Focus more on ${weakTopics.join(" and ")} — these are your weakest areas right now.`);
    }

    if (topicStats && topicStats.length > 0) {
        for (const topic of topicStats) {
            if (topic.accuracy !== null && topic.accuracy !== undefined && topic.accuracy < 60) {
                insights.push(`${topic.topic} accuracy is only ${topic.accuracy}%. Practice more problems in this topic.`);
                break;
            }
        }
    }

    for (const platform of (perPlatform || [])) {
        if (platform.monthlyGrowth !== null && platform.monthlyGrowth !== undefined) {
            if (platform.monthlyGrowth > 0) {
                insights.push(`You have improved consistently on ${platform.platform} — +${platform.monthlyGrowth} rating in the last month.`);
            } else if (platform.monthlyGrowth < -50) {
                insights.push(`Your ${platform.platform} rating dropped by ${Math.abs(platform.monthlyGrowth)} this month. Review your recent contest performance.`);
            }
        }
    }

    if (contestAnalytics) {
        if (contestAnalytics.totalContests < 5) {
            insights.push("You've participated in very few contests. Regular contest practice is key to improving under pressure.");
        }
        if (contestAnalytics.averageRank && contestAnalytics.averageRank > 5000) {
            insights.push("Your average contest rank is quite high. Focus on solving the first 2-3 problems quickly.");
        }
    }

    if (totals) {
        if (totals.totalSolved < 50) {
            insights.push("You've solved fewer than 50 problems. Aim for at least 100 to build strong fundamentals.");
        } else if (totals.totalSolved >= 200) {
            insights.push(`Great volume — ${totals.totalSolved} problems solved! Now focus on difficulty progression.`);
        }
    }

    for (const platform of (perPlatform || [])) {
        if (platform.currentRating) {
            const suggestedMin = platform.currentRating - 200;
            const suggestedMax = platform.currentRating + 200;
            insights.push(`Focus on ${suggestedMin}–${suggestedMax} rated problems on ${platform.platform} for optimal growth.`);
            break;
        }
    }

    const growths = (perPlatform || []).map(p => p.monthlyGrowth).filter(g => g !== null);
    if (growths.length > 0) {
        const avgGrowth = growths.reduce((a, b) => a + b, 0) / growths.length;
        if (avgGrowth > 0) {
            const twoMonthGain = Math.round(avgGrowth * 2);
            insights.push(`Expected rating improvement: +${Math.round(avgGrowth)} to +${twoMonthGain} within the next 2 months if current practice continues.`);
        }
    }

    if (insights.length === 0) {
        insights.push("Keep solving problems and participating in contests. More data will unlock detailed coaching insights.");
    }

    return insights;
};

// ANALYTICS SUMMARY BLOCK
const buildAnalyticsSummaryBlock = (analytics) => {
    const { perPlatform, totals, topicStats, weakTopics, strongTopics } = analytics;

    const platformSummary = (perPlatform || []).map(p => {
        const parts = [`${p.platform}:`];
        if (p.currentRating)          parts.push(`current rating ${p.currentRating}`);
        if (p.peakRating)             parts.push(`peak rating ${p.peakRating}`);
        if (p.monthlyGrowth !== null) parts.push(`${p.monthlyGrowth >= 0 ? "+" : ""}${p.monthlyGrowth} rating change in the last 30 days`);
        if (p.totalSolved)            parts.push(`${p.totalSolved} problems solved`);
        if (p.contestsCount)          parts.push(`${p.contestsCount} contests attended`);
        if (p.averageRank)            parts.push(`average contest rank: ${p.averageRank}`);
        return parts.join(", ");
    }).join("\n");

    const topicSummary = (topicStats || [])
        .map(t => {
            let line = `${t.topic}: ${t.problemCount || t.solved || 0} problems solved`;
            if (t.accuracy !== null && t.accuracy !== undefined) line += `, ${t.accuracy}% accuracy`;
            if (t.weaknessScore !== undefined) line += `, weakness score: ${t.weaknessScore}`;
            return line;
        })
        .join("\n");

    return `PLATFORM STATS:
${platformSummary || "No platform data synced yet"}

TOTAL PROBLEMS SOLVED: ${totals?.totalSolved || 0}
TOTAL CONTESTS: ${totals?.totalContests || 0}

TOPIC BREAKDOWN:
${topicSummary || "No topic data available yet"}

WEAK TOPICS: ${(weakTopics || []).join(", ") || "Not enough data yet"}
STRONG TOPICS: ${(strongTopics || []).join(", ") || "Not enough data yet"}`;
};

// BUILD COACH PROMPT
export const buildCoachPrompt = (type, analytics) => {
    const dataBlock = buildAnalyticsSummaryBlock(analytics);

    const prompts = {
        daily: `You are a competitive programming coach giving daily feedback. Based on the student's data below, give 3-4 short, actionable coaching sentences for today. Be direct about what to practice today. Reference actual numbers.

${dataBlock}

Write your daily feedback now. Keep it to 3-4 sentences. Plain conversational text, no markdown.`,

        weekly: `You are a competitive programming coach writing a weekly report. Based on the student's data below, provide:
1. This week's highlights (what went well)
2. Areas that need work
3. Specific goals for next week
4. Motivational closing

${dataBlock}

Write the weekly report now. Keep it under 200 words. Plain conversational text, no markdown formatting.`,

        monthly: `You are a competitive programming coach writing a monthly progress report. Based on the student's data below, provide a thorough analysis:
1. Overall progress summary
2. Rating trajectory analysis
3. Topic-wise strengths and gaps
4. Contest performance review
5. Recommended focus for next month
6. Predicted rating trajectory if current pace continues

${dataBlock}

Write the monthly report now. Keep it under 350 words. Plain conversational text, no markdown formatting.`,

        contest_review: `You are a competitive programming coach reviewing a student's recent contest performance. Based on the data below, analyze:
1. Performance trend across recent contests
2. What's working well
3. What's costing rating points
4. Specific improvement strategies for next contest

${dataBlock}

Write the contest review now. Keep it under 200 words. Plain conversational text, no markdown formatting.`,

        study_plan: `You are a competitive programming coach creating a personalized study plan. Based on the student's data below, create a structured plan:
1. Daily practice targets (number of problems, difficulty range)
2. Weekly topic rotation schedule targeting weak areas
3. Contest participation strategy
4. Milestones for the next 4 weeks
5. Resources or problem types to focus on

${dataBlock}

Write the study plan now. Keep it under 300 words. Plain conversational text, no markdown formatting. Use numbered lists for structure.`,
    };

    return prompts[type] || prompts.daily;
};
