// Run once: node prisma/seedProblems.js
// Seeds the Problem table with a curated bank of well-known problems

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const problems = [
    // ───── ARRAYS ─────
    { title: "Two Sum", slug: "two-sum", platform: "LEETCODE", topic: "Arrays", difficulty: "EASY", url: "https://leetcode.com/problems/two-sum/" },
    { title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", platform: "LEETCODE", topic: "Arrays", difficulty: "EASY", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
    { title: "Contains Duplicate", slug: "contains-duplicate", platform: "LEETCODE", topic: "Arrays", difficulty: "EASY", url: "https://leetcode.com/problems/contains-duplicate/" },
    { title: "Product of Array Except Self", slug: "product-of-array-except-self", platform: "LEETCODE", topic: "Arrays", difficulty: "MEDIUM", url: "https://leetcode.com/problems/product-of-array-except-self/" },
    { title: "3Sum", slug: "3sum", platform: "LEETCODE", topic: "Arrays", difficulty: "MEDIUM", url: "https://leetcode.com/problems/3sum/" },
    { title: "Trapping Rain Water", slug: "trapping-rain-water", platform: "LEETCODE", topic: "Arrays", difficulty: "HARD", url: "https://leetcode.com/problems/trapping-rain-water/" },

    // ───── DYNAMIC PROGRAMMING ─────
    { title: "Climbing Stairs", slug: "climbing-stairs", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY", url: "https://leetcode.com/problems/climbing-stairs/" },
    { title: "Maximum Subarray", slug: "maximum-subarray", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/maximum-subarray/" },
    { title: "House Robber", slug: "house-robber", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/house-robber/" },
    { title: "Coin Change", slug: "coin-change", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/coin-change/" },
    { title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
    { title: "Edit Distance", slug: "edit-distance", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD", url: "https://leetcode.com/problems/edit-distance/" },
    { title: "Regular Expression Matching", slug: "regular-expression-matching", platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD", url: "https://leetcode.com/problems/regular-expression-matching/" },

    // ───── GRAPHS ─────
    { title: "Flood Fill", slug: "flood-fill", platform: "LEETCODE", topic: "Graphs", difficulty: "EASY", url: "https://leetcode.com/problems/flood-fill/" },
    { title: "Number of Islands", slug: "number-of-islands", platform: "LEETCODE", topic: "Graphs", difficulty: "MEDIUM", url: "https://leetcode.com/problems/number-of-islands/" },
    { title: "Course Schedule", slug: "course-schedule", platform: "LEETCODE", topic: "Graphs", difficulty: "MEDIUM", url: "https://leetcode.com/problems/course-schedule/" },
    { title: "Clone Graph", slug: "clone-graph", platform: "LEETCODE", topic: "Graphs", difficulty: "MEDIUM", url: "https://leetcode.com/problems/clone-graph/" },
    { title: "Network Delay Time", slug: "network-delay-time", platform: "LEETCODE", topic: "Graphs", difficulty: "MEDIUM", url: "https://leetcode.com/problems/network-delay-time/" },
    { title: "Word Ladder", slug: "word-ladder", platform: "LEETCODE", topic: "Graphs", difficulty: "HARD", url: "https://leetcode.com/problems/word-ladder/" },

    // ───── BINARY SEARCH ─────
    { title: "Binary Search", slug: "binary-search", platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY", url: "https://leetcode.com/problems/binary-search/" },
    { title: "Search Insert Position", slug: "search-insert-position", platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY", url: "https://leetcode.com/problems/search-insert-position/" },
    { title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
    { title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
    { title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },

    // ───── GREEDY ALGORITHMS ─────
    { title: "Assign Cookies", slug: "assign-cookies", platform: "LEETCODE", topic: "Greedy Algorithms", difficulty: "EASY", url: "https://leetcode.com/problems/assign-cookies/" },
    { title: "Jump Game", slug: "jump-game", platform: "LEETCODE", topic: "Greedy Algorithms", difficulty: "MEDIUM", url: "https://leetcode.com/problems/jump-game/" },
    { title: "Gas Station", slug: "gas-station", platform: "LEETCODE", topic: "Greedy Algorithms", difficulty: "MEDIUM", url: "https://leetcode.com/problems/gas-station/" },
    { title: "Candy", slug: "candy", platform: "LEETCODE", topic: "Greedy Algorithms", difficulty: "HARD", url: "https://leetcode.com/problems/candy/" },

    // ───── TREES ─────
    { title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", platform: "LEETCODE", topic: "Trees", difficulty: "EASY", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
    { title: "Invert Binary Tree", slug: "invert-binary-tree", platform: "LEETCODE", topic: "Trees", difficulty: "EASY", url: "https://leetcode.com/problems/invert-binary-tree/" },
    { title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", platform: "LEETCODE", topic: "Trees", difficulty: "MEDIUM", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
    { title: "Lowest Common Ancestor of a Binary Tree", slug: "lowest-common-ancestor-of-a-binary-tree", platform: "LEETCODE", topic: "Trees", difficulty: "MEDIUM", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
    { title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", platform: "LEETCODE", topic: "Trees", difficulty: "HARD", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },

    // ───── HASHMAP AND SET ─────
    { title: "Two Sum II", slug: "two-sum-ii-input-array-is-sorted", platform: "LEETCODE", topic: "HashMap and Set", difficulty: "EASY", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
    { title: "Group Anagrams", slug: "group-anagrams", platform: "LEETCODE", topic: "HashMap and Set", difficulty: "MEDIUM", url: "https://leetcode.com/problems/group-anagrams/" },
    { title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", platform: "LEETCODE", topic: "HashMap and Set", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
    { title: "Subarray Sum Equals K", slug: "subarray-sum-equals-k", platform: "LEETCODE", topic: "HashMap and Set", difficulty: "MEDIUM", url: "https://leetcode.com/problems/subarray-sum-equals-k/" },

    // ───── STRING ─────
    { title: "Valid Anagram", slug: "valid-anagram", platform: "LEETCODE", topic: "String", difficulty: "EASY", url: "https://leetcode.com/problems/valid-anagram/" },
    { title: "Valid Palindrome", slug: "valid-palindrome", platform: "LEETCODE", topic: "String", difficulty: "EASY", url: "https://leetcode.com/problems/valid-palindrome/" },
    { title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-palindromic-substring/" },
    { title: "Minimum Window Substring", slug: "minimum-window-substring", platform: "LEETCODE", topic: "String", difficulty: "HARD", url: "https://leetcode.com/problems/minimum-window-substring/" },

    // ───── MATH ─────
    { title: "Sqrt(x)", slug: "sqrtx", platform: "LEETCODE", topic: "Math", difficulty: "EASY", url: "https://leetcode.com/problems/sqrtx/" },
    { title: "Pow(x, n)", slug: "powx-n", platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/powx-n/" },

    // ───── SORTING ─────
    { title: "Sort Colors", slug: "sort-colors", platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/sort-colors/" },
    { title: "Merge Intervals", slug: "merge-intervals", platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/merge-intervals/" },

    // ───── MATRIX ─────
    { title: "Rotate Image", slug: "rotate-image", platform: "LEETCODE", topic: "Matrix", difficulty: "MEDIUM", url: "https://leetcode.com/problems/rotate-image/" },
    { title: "Spiral Matrix", slug: "spiral-matrix", platform: "LEETCODE", topic: "Matrix", difficulty: "MEDIUM", url: "https://leetcode.com/problems/spiral-matrix/" },

    // ───── SIMULATION ─────
    { title: "Game of Life", slug: "game-of-life", platform: "LEETCODE", topic: "Simulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/game-of-life/" },
];

async function main() {
    console.log(`Seeding ${problems.length} problems...`);

    await prisma.problem.deleteMany({});
    await prisma.problem.createMany({ data: problems });

    console.log("✅ Problem bank seeded successfully");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
