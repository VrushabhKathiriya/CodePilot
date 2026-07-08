import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const problems = [
    { title: "Climbing Stairs", slug: "climbing-stairs", platform: "LEETCODE", topic: "dp", difficulty: "EASY", url: "https://leetcode.com/problems/climbing-stairs/" },
    { title: "House Robber", slug: "house-robber", platform: "LEETCODE", topic: "dp", difficulty: "MEDIUM", url: "https://leetcode.com/problems/house-robber/" },
    { title: "Longest Common Subsequence", slug: "longest-common-subsequence", platform: "LEETCODE", topic: "dp", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-common-subsequence/" },
    { title: "Edit Distance", slug: "edit-distance", platform: "LEETCODE", topic: "dp", difficulty: "HARD", url: "https://leetcode.com/problems/edit-distance/" },
    { title: "Mashmokh and ACM", slug: "codeforces-414b", platform: "CODEFORCES", topic: "dp", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/414/B" },

    { title: "Flood Fill", slug: "flood-fill", platform: "LEETCODE", topic: "graphs", difficulty: "EASY", url: "https://leetcode.com/problems/flood-fill/" },
    { title: "Number of Islands", slug: "number-of-islands", platform: "LEETCODE", topic: "graphs", difficulty: "MEDIUM", url: "https://leetcode.com/problems/number-of-islands/" },
    { title: "Course Schedule", slug: "course-schedule", platform: "LEETCODE", topic: "graphs", difficulty: "MEDIUM", url: "https://leetcode.com/problems/course-schedule/" },
    { title: "Network Delay Time", slug: "network-delay-time", platform: "LEETCODE", topic: "graphs", difficulty: "MEDIUM", url: "https://leetcode.com/problems/network-delay-time/" },
    { title: "Dijkstra?", slug: "codeforces-20c", platform: "CODEFORCES", topic: "graphs", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/20/C" },

    { title: "Binary Search", slug: "binary-search", platform: "LEETCODE", topic: "binary search", difficulty: "EASY", url: "https://leetcode.com/problems/binary-search/" },
    { title: "Search Insert Position", slug: "search-insert-position", platform: "LEETCODE", topic: "binary search", difficulty: "EASY", url: "https://leetcode.com/problems/search-insert-position/" },
    { title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", platform: "LEETCODE", topic: "binary search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
    { title: "Koko Eating Bananas", slug: "koko-eating-bananas", platform: "LEETCODE", topic: "binary search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/koko-eating-bananas/" },
    { title: "Magic Powder - 1", slug: "codeforces-670d1", platform: "CODEFORCES", topic: "binary search", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/670/D1" },

    { title: "Assign Cookies", slug: "assign-cookies", platform: "LEETCODE", topic: "greedy", difficulty: "EASY", url: "https://leetcode.com/problems/assign-cookies/" },
    { title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", platform: "LEETCODE", topic: "greedy", difficulty: "EASY", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
    { title: "Jump Game", slug: "jump-game", platform: "LEETCODE", topic: "greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/jump-game/" },
    { title: "Gas Station", slug: "gas-station", platform: "LEETCODE", topic: "greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/gas-station/" },
    { title: "Dragons", slug: "codeforces-230a", platform: "CODEFORCES", topic: "greedy", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/230/A" },

    { title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", platform: "LEETCODE", topic: "trees", difficulty: "EASY", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
    { title: "Invert Binary Tree", slug: "invert-binary-tree", platform: "LEETCODE", topic: "trees", difficulty: "EASY", url: "https://leetcode.com/problems/invert-binary-tree/" },
    { title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", platform: "LEETCODE", topic: "trees", difficulty: "MEDIUM", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
    { title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", platform: "LEETCODE", topic: "trees", difficulty: "MEDIUM", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
    { title: "Xenia and Tree", slug: "codeforces-342e", platform: "CODEFORCES", topic: "trees", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/342/E" },

    { title: "Two Sum II - Input Array Is Sorted", slug: "two-sum-ii-input-array-is-sorted", platform: "LEETCODE", topic: "two pointers", difficulty: "EASY", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
    { title: "Valid Palindrome", slug: "valid-palindrome", platform: "LEETCODE", topic: "two pointers", difficulty: "EASY", url: "https://leetcode.com/problems/valid-palindrome/" },
    { title: "3Sum", slug: "3sum", platform: "LEETCODE", topic: "two pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/3sum/" },
    { title: "Container With Most Water", slug: "container-with-most-water", platform: "LEETCODE", topic: "two pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/container-with-most-water/" },
    { title: "Books", slug: "codeforces-279b", platform: "CODEFORCES", topic: "two pointers", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/279/B" },

    { title: "Maximum Average Subarray I", slug: "maximum-average-subarray-i", platform: "LEETCODE", topic: "sliding window", difficulty: "EASY", url: "https://leetcode.com/problems/maximum-average-subarray-i/" },
    { title: "Minimum Size Subarray Sum", slug: "minimum-size-subarray-sum", platform: "LEETCODE", topic: "sliding window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
    { title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", platform: "LEETCODE", topic: "sliding window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
    { title: "Permutation in String", slug: "permutation-in-string", platform: "LEETCODE", topic: "sliding window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/permutation-in-string/" },
    { title: "They Are Everywhere", slug: "codeforces-701c", platform: "CODEFORCES", topic: "sliding window", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/701/C" },

    { title: "Valid Parentheses", slug: "valid-parentheses", platform: "LEETCODE", topic: "stack", difficulty: "EASY", url: "https://leetcode.com/problems/valid-parentheses/" },
    { title: "Min Stack", slug: "min-stack", platform: "LEETCODE", topic: "stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/min-stack/" },
    { title: "Daily Temperatures", slug: "daily-temperatures", platform: "LEETCODE", topic: "stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/daily-temperatures/" },
    { title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", platform: "LEETCODE", topic: "stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
    { title: "Alternating Current", slug: "codeforces-343b", platform: "CODEFORCES", topic: "stack", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/343/B" },

    { title: "Fibonacci Number", slug: "fibonacci-number", platform: "LEETCODE", topic: "recursion", difficulty: "EASY", url: "https://leetcode.com/problems/fibonacci-number/" },
    { title: "Power of Two", slug: "power-of-two", platform: "LEETCODE", topic: "recursion", difficulty: "EASY", url: "https://leetcode.com/problems/power-of-two/" },
    { title: "Pow(x, n)", slug: "powx-n", platform: "LEETCODE", topic: "recursion", difficulty: "MEDIUM", url: "https://leetcode.com/problems/powx-n/" },
    { title: "Generate Parentheses", slug: "generate-parentheses", platform: "LEETCODE", topic: "recursion", difficulty: "MEDIUM", url: "https://leetcode.com/problems/generate-parentheses/" },
    { title: "K-th Not Divisible by n", slug: "codeforces-1352c", platform: "CODEFORCES", topic: "recursion", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/1352/C" },

    { title: "Merge Sorted Array", slug: "merge-sorted-array", platform: "LEETCODE", topic: "sorting", difficulty: "EASY", url: "https://leetcode.com/problems/merge-sorted-array/" },
    { title: "Sort Colors", slug: "sort-colors", platform: "LEETCODE", topic: "sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/sort-colors/" },
    { title: "Merge Intervals", slug: "merge-intervals", platform: "LEETCODE", topic: "sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/merge-intervals/" },
    { title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", platform: "LEETCODE", topic: "sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
    { title: "Towers", slug: "codeforces-37a", platform: "CODEFORCES", topic: "sorting", difficulty: "HARD", url: "https://codeforces.com/problemset/problem/37/A" },
];

async function seedProblems() {
    console.log(`Seeding ${problems.length} problems...`);

    for (const problem of problems) {
        const existingProblem = await prisma.problem.findFirst({
            where: {
                slug: problem.slug,
                platform: problem.platform,
            },
        });

        if (existingProblem) {
            await prisma.problem.update({
                where: { id: existingProblem.id },
                data: problem,
            });
            continue;
        }

        await prisma.problem.create({ data: problem });
    }

    const count = await prisma.problem.count();
    console.log(`Problem bank seeded successfully. Total problems: ${count}`);
}

seedProblems()
    .catch((error) => {
        console.error("Problem seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
