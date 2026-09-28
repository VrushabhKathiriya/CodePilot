// ─── RULE-BASED FALLBACK (type-aware) ────────────────────────────────────────
export const generateRuleBasedInsights = (analytics, type = "daily") => {
    const { perPlatform, totals, weakTopics, strongTopics, contestAnalytics } = analytics;

    const platform    = perPlatform?.[0];
    const totalSolved = totals?.totalSolved || 0;
    const rating      = platform?.currentRating;
    const growth      = platform?.monthlyGrowth;

    // ─── DAILY ───────────────────────────────────────────────────────────────
    if (type === "daily") {
        const lines = [];

        if (weakTopics?.length)
            lines.push(`Today's focus: practice ${weakTopics[0]}${weakTopics[1] ? ` and ${weakTopics[1]}` : ""} — these are your weakest areas right now.`);

        if (rating)
            lines.push(`Solve 2-3 problems in the ${rating - 100}–${rating + 100} rating range on ${platform.platform} to stay in your growth zone.`);

        if (totalSolved < 100)
            lines.push(`You've solved ${totalSolved} problems — aim for at least 2 problems today to build consistency.`);
        else if (totalSolved < 300)
            lines.push(`Good volume at ${totalSolved} problems — push yourself with at least one MEDIUM or HARD problem today.`);
        else
            lines.push(`${totalSolved} problems solved — stay sharp by attempting at least one HARD problem today.`);

        if (strongTopics?.length)
            lines.push(`Your ${strongTopics[0]} is a strength — use it in contests to score early points confidently.`);

        if (lines.length === 0)
            lines.push(`Solve 2-3 problems today. Sync your LeetCode or Codeforces account to get personalized daily targets.`);

        return lines;
    }

    // ─── WEEKLY ──────────────────────────────────────────────────────────────
    if (type === "weekly") {
        const weeklyTarget = totalSolved < 100 ? 15 : 20;
        const lines = [
            `Weekly target: ${weeklyTarget}+ problems across varied topics.`,
        ];

        if (weakTopics?.length > 0)
            lines.push(`This week's priority topics: ${weakTopics.slice(0, 3).join(", ")}. Spend at least 2 days focused on these.`);

        if (contestAnalytics?.totalContests < 3)
            lines.push(`You've participated in only ${contestAnalytics?.totalContests || 0} contests — join at least 1 contest this week to benchmark your progress.`);
        else
            lines.push(`Maintain your contest habit: participate in at least 1 rated contest this week.`);

        if (growth !== null && growth !== undefined)
            lines.push(growth > 0
                ? `Your rating grew +${growth} last month — keep the momentum by upsolving problems you couldn't solve in contests.`
                : `Rating dipped ${Math.abs(growth)} last month — this week focus on consistency over difficulty.`);

        lines.push(`End-of-week goal: review all problems you got wrong or couldn't solve, and understand the solution patterns.`);

        return lines;
    }

    // ─── MONTHLY ─────────────────────────────────────────────────────────────
    if (type === "monthly") {
        const lines = [
            `Monthly snapshot: ${totalSolved} total problems solved across all platforms.`,
        ];

        for (const p of (perPlatform || [])) {
            if (p.currentRating) {
                const sign = (p.monthlyGrowth >= 0) ? "+" : "";
                lines.push(`${p.platform}: current rating ${p.currentRating}${p.monthlyGrowth != null ? `, ${sign}${p.monthlyGrowth} this month` : ""}.`);
            }
        }

        if (weakTopics?.length)
            lines.push(`Biggest gaps to close this month: ${weakTopics.slice(0, 4).join(", ")}.`);

        const contestCount = contestAnalytics?.totalContests || 0;
        lines.push(`Contests this period: ${contestCount}. Target for next month: ${contestCount + 4} contests minimum.`);

        if (rating)
            lines.push(`Rating milestone to aim for: ${rating + 100}. This requires consistent daily practice and 4+ contests.`);

        lines.push(`Next month strategy: increase HARD problem ratio to 25-30% and focus on contest-style timed solving.`);

        return lines;
    }

    // ─── CONTEST REVIEW ──────────────────────────────────────────────────────
    if (type === "contest_review") {
        const lines = [];

        const total = contestAnalytics?.totalContests || 0;
        if (total === 0) {
            lines.push(`No contest history found yet. Start with Codeforces Div. 3 or Div. 4 contests — they're beginner-friendly and rated.`);
            lines.push(`LeetCode Weekly/Biweekly contests are also great for practice at any level.`);
        } else {
            lines.push(`Contest history: ${total} contests participated so far.`);
            if (contestAnalytics?.averageRank)
                lines.push(`Average rank: ${contestAnalytics.averageRank}. Aim to break into the top 30% by solving problems 1-2 in under 10 minutes.`);
            if (growth > 0)
                lines.push(`Positive rating trend (+${growth} last month) — your contest consistency is paying off.`);
            else if (growth < -30)
                lines.push(`Rating dropped ${Math.abs(growth)} last month — focus on upsolving: after each contest, solve the problems you couldn't during the contest.`);
        }

        if (weakTopics?.length)
            lines.push(`Contest weak spots: ${weakTopics.slice(0, 2).join(" and ")} frequently appear in contests — targeted practice here will directly improve your rank.`);

        lines.push(`Next contest strategy: solve problem 1 in under 5 min, problem 2 in under 15 min — this alone pushes you into the top 40%.`);

        return lines;
    }

    // ─── STUDY PLAN ──────────────────────────────────────────────────────────
    if (type === "study_plan") {
        const lines = [
            `Daily routine: 1 easy warm-up + 1-2 medium/hard problems = 2-3 problems/day.`,
        ];

        if (weakTopics?.length)
            lines.push(`Weeks 1-2: Drill ${weakTopics.slice(0, 2).join(" and ")} — complete 5 problems per topic each week.`);

        if (weakTopics?.length > 2)
            lines.push(`Weeks 3-4: Move to ${weakTopics.slice(2, 4).join(" and ")} — continue the same 5 problems/week/topic pattern.`);

        if (rating)
            lines.push(`Rating target for 4 weeks: ${rating + 100}. This is achievable with 20+ problems/week + 1 contest/week.`);

        lines.push(`Never skip your weekly contest — it's the most accurate measure of real competitive ability.`);

        return lines;
    }

    return ["Keep solving problems and participating in contests. Sync your accounts for personalized coaching insights."];
};


// ─── ANALYTICS SUMMARY BLOCK ─────────────────────────────────────────────────
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
            return line;
        })
        .join("\n");

    return `PLATFORM STATS:
${platformSummary || "No platform data synced yet"}

TOTAL PROBLEMS SOLVED: ${totals?.totalSolved || 0}
TOTAL CONTESTS: ${totals?.totalContests || 0}

TOPIC BREAKDOWN:
${topicSummary || "No topic data available yet"}

WEAK TOPICS:   ${(weakTopics  || []).join(", ") || "Not enough data yet"}
STRONG TOPICS: ${(strongTopics || []).join(", ") || "Not enough data yet"}`;
};


// ─── BUILD GEMINI PROMPT ──────────────────────────────────────────────────────
export const buildCoachPrompt = (type, analytics) => {
    const dataBlock = buildAnalyticsSummaryBlock(analytics);

    const prompts = {
        daily: `You are a competitive programming coach giving a DAILY coaching note.
Based on the student data below, write 3-4 SHORT, SPECIFIC, ACTIONABLE sentences for TODAY only.
Tell the student exactly what topic to practice today and how many problems to solve.
Reference their actual rating and weak topics by name.

${dataBlock}

Write the daily note now. 3-4 sentences max. Plain text, no bullet points, no markdown.`,

        weekly: `You are a competitive programming coach writing a WEEKLY PLAN.
Based on the student data below, write a focused plan for the NEXT 7 DAYS covering:
1. Problems-per-day target
2. Which 2-3 weak topics to focus on this week
3. Contest participation goal
4. One specific thing to upsolve or review

${dataBlock}

Write the weekly plan now. Under 180 words. Plain conversational text, no markdown headers.`,

        monthly: `You are a competitive programming coach writing a MONTHLY PROGRESS REPORT.
Based on the student data below, provide:
1. Rating progress this month (use exact numbers)
2. Problem-solving volume analysis
3. Top 2-3 topic gaps to address next month
4. Contest performance trend
5. Specific rating target for next month with a realistic timeline

${dataBlock}

Write the monthly report now. Under 300 words. Plain conversational text, no markdown.`,

        contest_review: `You are a competitive programming coach reviewing CONTEST PERFORMANCE.
Based on the student data below, analyze:
1. Contest participation frequency (is it enough?)
2. Rating trend across recent contests
3. Which topics are costing them points in contests
4. Exact strategy for their NEXT contest (how to approach problem order, time allocation)

${dataBlock}

Write the contest review now. Under 200 words. Plain conversational text, no markdown.`,

        study_plan: `You are a competitive programming coach creating a 4-WEEK STUDY PLAN.
Based on the student data below, create a structured plan with:
1. Daily problem quota (easy/medium/hard breakdown)
2. Week-by-week topic rotation targeting their weakest areas
3. Contest schedule (how many per week)
4. Specific rating milestone for end of 4 weeks

${dataBlock}

Write the study plan now. Under 280 words. Plain text. Use "Week 1:", "Week 2:" labels for structure.`,
    };

    return prompts[type] || prompts.daily;
};
