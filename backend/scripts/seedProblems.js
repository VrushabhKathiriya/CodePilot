import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// PROBLEM BANK SEED
// Curated problems across 10 standard topics,
// spanning EASY/MEDIUM/HARD difficulties.
// Mix of LeetCode and Codeforces problems.
// ─────────────────────────────────────────────

const problems = [
    // ── Dynamic Programming ──
    { title: "Climbing Stairs", slug: "climbing-stairs", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY", ratingLevel: 800, url: "https://leetcode.com/problems/climbing-stairs/" },
    { title: "House Robber", slug: "house-robber", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/house-robber/" },
    { title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", ratingLevel: 1400, url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
    { title: "Edit Distance", slug: "edit-distance", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", ratingLevel: 1600, url: "https://leetcode.com/problems/edit-distance/" },
    { title: "Burst Balloons", slug: "burst-balloons", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD", ratingLevel: 2000, url: "https://leetcode.com/problems/burst-balloons/" },

    // ── Graphs ──
    { title: "Number of Islands", slug: "number-of-islands", platform: "LEETCODE", topic: "Graphs", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/number-of-islands/" },
    { title: "Course Schedule", slug: "course-schedule", platform: "LEETCODE", topic: "Graphs", difficulty: "MEDIUM", ratingLevel: 1400, url: "https://leetcode.com/problems/course-schedule/" },
    { title: "Clone Graph", slug: "clone-graph", platform: "LEETCODE", topic: "Graphs", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/clone-graph/" },
    { title: "Network Delay Time", slug: "network-delay-time", platform: "LEETCODE", topic: "Graphs", difficulty: "MEDIUM", ratingLevel: 1600, url: "https://leetcode.com/problems/network-delay-time/" },
    { title: "Alien Dictionary", slug: "alien-dictionary", platform: "LEETCODE", topic: "Graphs", difficulty: "HARD", ratingLevel: 2000, url: "https://leetcode.com/problems/alien-dictionary/" },

    // ── Trees ──
    { title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", platform: "LEETCODE", topic: "Trees", difficulty: "EASY", ratingLevel: 800, url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
    { title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", platform: "LEETCODE", topic: "Trees", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/validate-binary-search-tree/" },
    { title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", platform: "LEETCODE", topic: "Trees", difficulty: "MEDIUM", ratingLevel: 1000, url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
    { title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", platform: "LEETCODE", topic: "Trees", difficulty: "HARD", ratingLevel: 1800, url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },

    // ── Binary Search ──
    { title: "Binary Search", slug: "binary-search", platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY", ratingLevel: 800, url: "https://leetcode.com/problems/binary-search/" },
    { title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", ratingLevel: 1400, url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
    { title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
    { title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD", ratingLevel: 2000, url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },

    // ── Greedy ──
    { title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", platform: "LEETCODE", topic: "Greedy", difficulty: "EASY", ratingLevel: 800, url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
    { title: "Jump Game", slug: "jump-game", platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/jump-game/" },
    { title: "Gas Station", slug: "gas-station", platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", ratingLevel: 1400, url: "https://leetcode.com/problems/gas-station/" },
    { title: "Candy", slug: "candy", platform: "LEETCODE", topic: "Greedy", difficulty: "HARD", ratingLevel: 1800, url: "https://leetcode.com/problems/candy/" },

    // ── Strings ──
    { title: "Valid Anagram", slug: "valid-anagram", platform: "LEETCODE", topic: "Strings", difficulty: "EASY", ratingLevel: 800, url: "https://leetcode.com/problems/valid-anagram/" },
    { title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", platform: "LEETCODE", topic: "Strings", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
    { title: "Group Anagrams", slug: "group-anagrams", platform: "LEETCODE", topic: "Strings", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/group-anagrams/" },
    { title: "Minimum Window Substring", slug: "minimum-window-substring", platform: "LEETCODE", topic: "Strings", difficulty: "HARD", ratingLevel: 1800, url: "https://leetcode.com/problems/minimum-window-substring/" },

    // ── Math ──
    { title: "Palindrome Number", slug: "palindrome-number", platform: "LEETCODE", topic: "Math", difficulty: "EASY", ratingLevel: 800, url: "https://leetcode.com/problems/palindrome-number/" },
    { title: "Pow(x, n)", slug: "powx-n", platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/powx-n/" },
    { title: "Count Primes", slug: "count-primes", platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/count-primes/" },
    { title: "Max Points on a Line", slug: "max-points-on-a-line", platform: "LEETCODE", topic: "Math", difficulty: "HARD", ratingLevel: 1800, url: "https://leetcode.com/problems/max-points-on-a-line/" },

    // ── Bit Manipulation ──
    { title: "Single Number", slug: "single-number", platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY", ratingLevel: 800, url: "https://leetcode.com/problems/single-number/" },
    { title: "Counting Bits", slug: "counting-bits", platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY", ratingLevel: 1000, url: "https://leetcode.com/problems/counting-bits/" },
    { title: "Reverse Bits", slug: "reverse-bits", platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY", ratingLevel: 1000, url: "https://leetcode.com/problems/reverse-bits/" },
    { title: "Bitwise AND of Numbers Range", slug: "bitwise-and-of-numbers-range", platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", ratingLevel: 1400, url: "https://leetcode.com/problems/bitwise-and-of-numbers-range/" },

    // ── Prefix Sum ──
    { title: "Running Sum of 1d Array", slug: "running-sum-of-1d-array", platform: "LEETCODE", topic: "Prefix Sum", difficulty: "EASY", ratingLevel: 800, url: "https://leetcode.com/problems/running-sum-of-1d-array/" },
    { title: "Subarray Sum Equals K", slug: "subarray-sum-equals-k", platform: "LEETCODE", topic: "Prefix Sum", difficulty: "MEDIUM", ratingLevel: 1400, url: "https://leetcode.com/problems/subarray-sum-equals-k/" },
    { title: "Product of Array Except Self", slug: "product-of-array-except-self", platform: "LEETCODE", topic: "Prefix Sum", difficulty: "MEDIUM", ratingLevel: 1400, url: "https://leetcode.com/problems/product-of-array-except-self/" },
    { title: "Range Sum Query 2D - Immutable", slug: "range-sum-query-2d-immutable", platform: "LEETCODE", topic: "Prefix Sum", difficulty: "MEDIUM", ratingLevel: 1600, url: "https://leetcode.com/problems/range-sum-query-2d-immutable/" },

    // ── Sliding Window ──
    { title: "Maximum Average Subarray I", slug: "maximum-average-subarray-i", platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY", ratingLevel: 800, url: "https://leetcode.com/problems/maximum-average-subarray-i/" },
    { title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement", platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", ratingLevel: 1400, url: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
    { title: "Permutation in String", slug: "permutation-in-string", platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", ratingLevel: 1200, url: "https://leetcode.com/problems/permutation-in-string/" },
    { title: "Sliding Window Maximum", slug: "sliding-window-maximum", platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD", ratingLevel: 1800, url: "https://leetcode.com/problems/sliding-window-maximum/" },
];

async function seed() {
    console.log(`Seeding ${problems.length} problems...`);

    for (const problem of problems) {
        await prisma.problem.upsert({
            where: {
                id: undefined, // force create if not found
            },
            update: {},
            create: problem,
        }).catch(async () => {
            // If upsert fails (no unique constraint on slug), try create
            // Check if problem with same slug exists
            const existing = await prisma.problem.findFirst({
                where: { slug: problem.slug, platform: problem.platform },
            });
            if (!existing) {
                await prisma.problem.create({ data: problem });
            } else {
                console.log(`  ↳ Skipped (exists): ${problem.title}`);
            }
        });
    }

    const count = await prisma.problem.count();
    console.log(`✓ Problem bank now has ${count} problems.`);
}

seed()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error("Seed failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
