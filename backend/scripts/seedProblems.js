import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 18 topics × 15 problems (5 EASY + 5 MEDIUM + 5 HARD) = 270 problems
// Topic names match LeetCode's official tagName values exactly.
const problems = [

    // ─── ARRAY ───────────────────────────────────────────────────────────────────
    { title: "Two Sum",                           slug: "two-sum",                           platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/two-sum/" },
    { title: "Best Time to Buy and Sell Stock",   slug: "best-time-to-buy-and-sell-stock",   platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
    { title: "Contains Duplicate",                slug: "contains-duplicate",                platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/contains-duplicate/" },
    { title: "Maximum Subarray",                  slug: "maximum-subarray",                  platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/maximum-subarray/" },
    { title: "Move Zeroes",                       slug: "move-zeroes",                       platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/move-zeroes/" },
    { title: "Product of Array Except Self",      slug: "product-of-array-except-self",      platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/product-of-array-except-self/" },
    { title: "Maximum Product Subarray",          slug: "maximum-product-subarray",          platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/maximum-product-subarray/" },
    { title: "Container With Most Water",         slug: "container-with-most-water",         platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/container-with-most-water/" },
    { title: "Rotate Array",                      slug: "rotate-array",                      platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/rotate-array/" },
    { title: "Set Matrix Zeroes",                 slug: "set-matrix-zeroes",                 platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/set-matrix-zeroes/" },
    { title: "Trapping Rain Water",               slug: "trapping-rain-water",               platform: "LEETCODE", topic: "Array", difficulty: "HARD",   url: "https://leetcode.com/problems/trapping-rain-water/" },
    { title: "First Missing Positive",            slug: "first-missing-positive",            platform: "LEETCODE", topic: "Array", difficulty: "HARD",   url: "https://leetcode.com/problems/first-missing-positive/" },
    { title: "Largest Rectangle in Histogram",   slug: "largest-rectangle-in-histogram",   platform: "LEETCODE", topic: "Array", difficulty: "HARD",   url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
    { title: "Maximum Gap",                       slug: "maximum-gap",                       platform: "LEETCODE", topic: "Array", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-gap/" },
    { title: "Max Sum of Rectangle No Larger Than K", slug: "max-sum-of-rectangle-no-larger-than-k", platform: "LEETCODE", topic: "Array", difficulty: "HARD", url: "https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/" },

    // ─── STRING ──────────────────────────────────────────────────────────────────
    { title: "Valid Anagram",                          slug: "valid-anagram",                          platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/valid-anagram/" },
    { title: "Longest Common Prefix",                  slug: "longest-common-prefix",                  platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/longest-common-prefix/" },
    { title: "Reverse String",                         slug: "reverse-string",                         platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/reverse-string/" },
    { title: "First Unique Character in a String",     slug: "first-unique-character-in-a-string",     platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/first-unique-character-in-a-string/" },
    { title: "Add Binary",                             slug: "add-binary",                             platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/add-binary/" },
    { title: "Longest Palindromic Substring",          slug: "longest-palindromic-substring",          platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-palindromic-substring/" },
    { title: "Group Anagrams",                         slug: "group-anagrams",                         platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/group-anagrams/" },
    { title: "String to Integer (atoi)",               slug: "string-to-integer-atoi",                 platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/string-to-integer-atoi/" },
    { title: "Decode String",                          slug: "decode-string",                          platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/decode-string/" },
    { title: "Zigzag Conversion",                      slug: "zigzag-conversion",                      platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/zigzag-conversion/" },
    { title: "Minimum Window Substring",               slug: "minimum-window-substring",               platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-window-substring/" },
    { title: "Regular Expression Matching",            slug: "regular-expression-matching",            platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/regular-expression-matching/" },
    { title: "Wildcard Matching",                      slug: "wildcard-matching",                      platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/wildcard-matching/" },
    { title: "Longest Valid Parentheses",              slug: "longest-valid-parentheses",              platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/longest-valid-parentheses/" },
    { title: "Text Justification",                     slug: "text-justification",                     platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/text-justification/" },

    // ─── HASH TABLE ──────────────────────────────────────────────────────────────
    { title: "Ransom Note",                                 slug: "ransom-note",                                 platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/ransom-note/" },
    { title: "Isomorphic Strings",                         slug: "isomorphic-strings",                         platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/isomorphic-strings/" },
    { title: "Word Pattern",                               slug: "word-pattern",                               platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/word-pattern/" },
    { title: "Happy Number",                               slug: "happy-number",                               platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/happy-number/" },
    { title: "Majority Element",                           slug: "majority-element",                           platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/majority-element/" },
    { title: "Top K Frequent Elements",                    slug: "top-k-frequent-elements",                    platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
    { title: "Longest Consecutive Sequence",               slug: "longest-consecutive-sequence",               platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-consecutive-sequence/" },
    { title: "Find All Anagrams in a String",              slug: "find-all-anagrams-in-a-string",              platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" },
    { title: "4Sum II",                                    slug: "4sum-ii",                                    platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/4sum-ii/" },
    { title: "LRU Cache",                                  slug: "lru-cache",                                  platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/lru-cache/" },
    { title: "Substring with Concatenation of All Words",  slug: "substring-with-concatenation-of-all-words",  platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/" },
    { title: "Max Points on a Line",                       slug: "max-points-on-a-line",                       platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/max-points-on-a-line/" },
    { title: "All O`one Data Structure",                   slug: "all-oone-data-structure",                    platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/all-oone-data-structure/" },
    { title: "Number of Atoms",                            slug: "number-of-atoms",                            platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/number-of-atoms/" },
    { title: "Palindrome Pairs",                           slug: "palindrome-pairs",                           platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/palindrome-pairs/" },

    // ─── MATH ────────────────────────────────────────────────────────────────────
    { title: "Palindrome Number",            slug: "palindrome-number",            platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/palindrome-number/" },
    { title: "Fizz Buzz",                    slug: "fizz-buzz",                    platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/fizz-buzz/" },
    { title: "Roman to Integer",             slug: "roman-to-integer",             platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/roman-to-integer/" },
    { title: "Sqrt(x)",                      slug: "sqrtx",                        platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/sqrtx/" },
    { title: "Excel Sheet Column Number",    slug: "excel-sheet-column-number",    platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/excel-sheet-column-number/" },
    { title: "Pow(x, n)",                    slug: "powx-n",                       platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/powx-n/" },
    { title: "Reverse Integer",              slug: "reverse-integer",              platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/reverse-integer/" },
    { title: "Multiply Strings",             slug: "multiply-strings",             platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/multiply-strings/" },
    { title: "Count Primes",                 slug: "count-primes",                 platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/count-primes/" },
    { title: "Fraction to Recurring Decimal",slug: "fraction-to-recurring-decimal",platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/fraction-to-recurring-decimal/" },
    { title: "Basic Calculator",             slug: "basic-calculator",             platform: "LEETCODE", topic: "Math", difficulty: "HARD",   url: "https://leetcode.com/problems/basic-calculator/" },
    { title: "Expression Add Operators",     slug: "expression-add-operators",     platform: "LEETCODE", topic: "Math", difficulty: "HARD",   url: "https://leetcode.com/problems/expression-add-operators/" },
    { title: "Integer to English Words",     slug: "integer-to-english-words",     platform: "LEETCODE", topic: "Math", difficulty: "HARD",   url: "https://leetcode.com/problems/integer-to-english-words/" },
    { title: "Reaching Points",              slug: "reaching-points",              platform: "LEETCODE", topic: "Math", difficulty: "HARD",   url: "https://leetcode.com/problems/reaching-points/" },
    { title: "Number of Digit One",          slug: "number-of-digit-one",          platform: "LEETCODE", topic: "Math", difficulty: "HARD",   url: "https://leetcode.com/problems/number-of-digit-one/" },

    // ─── SORTING ─────────────────────────────────────────────────────────────────
    { title: "Sort Array By Parity",              slug: "sort-array-by-parity",              platform: "LEETCODE", topic: "Sorting", difficulty: "EASY",   url: "https://leetcode.com/problems/sort-array-by-parity/" },
    { title: "Squares of a Sorted Array",         slug: "squares-of-a-sorted-array",         platform: "LEETCODE", topic: "Sorting", difficulty: "EASY",   url: "https://leetcode.com/problems/squares-of-a-sorted-array/" },
    { title: "Merge Sorted Array",                slug: "merge-sorted-array",                platform: "LEETCODE", topic: "Sorting", difficulty: "EASY",   url: "https://leetcode.com/problems/merge-sorted-array/" },
    { title: "Height Checker",                    slug: "height-checker",                    platform: "LEETCODE", topic: "Sorting", difficulty: "EASY",   url: "https://leetcode.com/problems/height-checker/" },
    { title: "How Many Numbers Are Smaller Than the Current Number", slug: "how-many-numbers-are-smaller-than-the-current-number", platform: "LEETCODE", topic: "Sorting", difficulty: "EASY", url: "https://leetcode.com/problems/how-many-numbers-are-smaller-than-the-current-number/" },
    { title: "Sort Colors",                       slug: "sort-colors",                       platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/sort-colors/" },
    { title: "Kth Largest Element in an Array",   slug: "kth-largest-element-in-an-array",   platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
    { title: "Sort List",                         slug: "sort-list",                         platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/sort-list/" },
    { title: "Custom Sort String",                slug: "custom-sort-string",                platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/custom-sort-string/" },
    { title: "Wiggle Sort II",                    slug: "wiggle-sort-ii",                    platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/wiggle-sort-ii/" },
    { title: "Count of Range Sum",                slug: "count-of-range-sum",                platform: "LEETCODE", topic: "Sorting", difficulty: "HARD",   url: "https://leetcode.com/problems/count-of-range-sum/" },
    { title: "Reverse Pairs",                     slug: "reverse-pairs",                     platform: "LEETCODE", topic: "Sorting", difficulty: "HARD",   url: "https://leetcode.com/problems/reverse-pairs/" },
    { title: "Count of Smaller Numbers After Self", slug: "count-of-smaller-numbers-after-self", platform: "LEETCODE", topic: "Sorting", difficulty: "HARD", url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/" },
    { title: "Russian Doll Envelopes",            slug: "russian-doll-envelopes",            platform: "LEETCODE", topic: "Sorting", difficulty: "HARD",   url: "https://leetcode.com/problems/russian-doll-envelopes/" },
    { title: "Median of Two Sorted Arrays",       slug: "median-of-two-sorted-arrays",       platform: "LEETCODE", topic: "Sorting", difficulty: "HARD",   url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },

    // ─── TWO POINTERS ────────────────────────────────────────────────────────────
    { title: "Valid Palindrome",                     slug: "valid-palindrome",                     platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/valid-palindrome/" },
    { title: "Remove Duplicates from Sorted Array",  slug: "remove-duplicates-from-sorted-array",  platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
    { title: "Remove Element",                       slug: "remove-element",                       platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/remove-element/" },
    { title: "Is Subsequence",                       slug: "is-subsequence",                       platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/is-subsequence/" },
    { title: "Backspace String Compare",             slug: "backspace-string-compare",             platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/backspace-string-compare/" },
    { title: "Two Sum II - Input Array Is Sorted",   slug: "two-sum-ii-input-array-is-sorted",     platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
    { title: "3Sum",                                 slug: "3sum",                                 platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/3sum/" },
    { title: "3Sum Closest",                         slug: "3sum-closest",                         platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/3sum-closest/" },
    { title: "Boats to Save People",                 slug: "boats-to-save-people",                 platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/boats-to-save-people/" },
    { title: "4Sum",                                 slug: "4sum",                                 platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/4sum/" },
    { title: "Shortest Subarray with Sum at Least K", slug: "shortest-subarray-with-sum-at-least-k", platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD", url: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/" },
    { title: "Subarrays with K Different Integers",  slug: "subarrays-with-k-different-integers",  platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD",   url: "https://leetcode.com/problems/subarrays-with-k-different-integers/" },
    { title: "Count Unique Characters of All Substrings of a Given String", slug: "count-unique-characters-of-all-substrings-of-a-given-string", platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD", url: "https://leetcode.com/problems/count-unique-characters-of-all-substrings-of-a-given-string/" },
    { title: "Sliding Window Median",                slug: "sliding-window-median",                platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD",   url: "https://leetcode.com/problems/sliding-window-median/" },
    { title: "Number of Flowers in Full Bloom",      slug: "number-of-flowers-in-full-bloom",      platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD",   url: "https://leetcode.com/problems/number-of-flowers-in-full-bloom/" },

    // ─── SLIDING WINDOW ──────────────────────────────────────────────────────────
    { title: "Maximum Average Subarray I",                           slug: "maximum-average-subarray-i",                           platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/maximum-average-subarray-i/" },
    { title: "Contains Duplicate II",                                slug: "contains-duplicate-ii",                                platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/contains-duplicate-ii/" },
    { title: "Longest Continuous Increasing Subsequence",            slug: "longest-continuous-increasing-subsequence",            platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/longest-continuous-increasing-subsequence/" },
    { title: "Find All K-Distant Indices in an Array",               slug: "find-all-k-distant-indices-in-an-array",               platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/find-all-k-distant-indices-in-an-array/" },
    { title: "Substrings of Size Three with Distinct Characters",    slug: "substrings-of-size-three-with-distinct-characters",    platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/substrings-of-size-three-with-distinct-characters/" },
    { title: "Minimum Size Subarray Sum",                            slug: "minimum-size-subarray-sum",                            platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
    { title: "Permutation in String",                                slug: "permutation-in-string",                                platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/permutation-in-string/" },
    { title: "Fruit Into Baskets",                                   slug: "fruit-into-baskets",                                   platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/fruit-into-baskets/" },
    { title: "Longest Repeating Character Replacement",              slug: "longest-repeating-character-replacement",              platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
    { title: "Max Consecutive Ones III",                             slug: "max-consecutive-ones-iii",                             platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/max-consecutive-ones-iii/" },
    { title: "Sliding Window Maximum",                               slug: "sliding-window-maximum",                               platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/sliding-window-maximum/" },
    { title: "Minimum Number of K Consecutive Bit Flips",           slug: "minimum-number-of-k-consecutive-bit-flips",           platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-number-of-k-consecutive-bit-flips/" },
    { title: "Count Subarrays With Score Less Than K",               slug: "count-subarrays-with-score-less-than-k",               platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/count-subarrays-with-score-less-than-k/" },
    { title: "Find the Longest Awesome Substring",                   slug: "find-the-longest-awesome-substring",                   platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/find-the-longest-awesome-substring/" },
    { title: "Minimum Adjacent Swaps for K Consecutive Ones",        slug: "minimum-adjacent-swaps-for-k-consecutive-ones",        platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-adjacent-swaps-for-k-consecutive-ones/" },

    // ─── BINARY SEARCH ───────────────────────────────────────────────────────────
    { title: "Binary Search",                                slug: "binary-search",                                platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/binary-search/" },
    { title: "Search Insert Position",                       slug: "search-insert-position",                       platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/search-insert-position/" },
    { title: "Count Negative Numbers in a Sorted Matrix",    slug: "count-negative-numbers-in-a-sorted-matrix",    platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/count-negative-numbers-in-a-sorted-matrix/" },
    { title: "Find Smallest Letter Greater Than Target",     slug: "find-smallest-letter-greater-than-target",     platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/find-smallest-letter-greater-than-target/" },
    { title: "Guess Number Higher or Lower",                 slug: "guess-number-higher-or-lower",                 platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/guess-number-higher-or-lower/" },
    { title: "Search in Rotated Sorted Array",               slug: "search-in-rotated-sorted-array",               platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
    { title: "Find Minimum in Rotated Sorted Array",         slug: "find-minimum-in-rotated-sorted-array",         platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
    { title: "Find Peak Element",                            slug: "find-peak-element",                            platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/find-peak-element/" },
    { title: "Koko Eating Bananas",                          slug: "koko-eating-bananas",                          platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/koko-eating-bananas/" },
    { title: "Search a 2D Matrix",                           slug: "search-a-2d-matrix",                           platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/search-a-2d-matrix/" },
    { title: "Split Array Largest Sum",                      slug: "split-array-largest-sum",                      platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD",   url: "https://leetcode.com/problems/split-array-largest-sum/" },
    { title: "Find in Mountain Array",                       slug: "find-in-mountain-array",                       platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD",   url: "https://leetcode.com/problems/find-in-mountain-array/" },
    { title: "Find K-th Smallest Pair Distance",             slug: "find-k-th-smallest-pair-distance",             platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD",   url: "https://leetcode.com/problems/find-k-th-smallest-pair-distance/" },
    { title: "Nth Magical Number",                           slug: "nth-magical-number",                           platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD",   url: "https://leetcode.com/problems/nth-magical-number/" },
    { title: "Maximum Number of Events That Can Be Attended II", slug: "maximum-number-of-events-that-can-be-attended-ii", platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD", url: "https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended-ii/" },

    // ─── STACK ───────────────────────────────────────────────────────────────────
    { title: "Valid Parentheses",           slug: "valid-parentheses",           platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/valid-parentheses/" },
    { title: "Implement Queue using Stacks",slug: "implement-queue-using-stacks",platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/implement-queue-using-stacks/" },
    { title: "Next Greater Element I",      slug: "next-greater-element-i",      platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/next-greater-element-i/" },
    { title: "Baseball Game",               slug: "baseball-game",               platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/baseball-game/" },
    { title: "Make The String Great",       slug: "make-the-string-great",       platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/make-the-string-great/" },
    { title: "Min Stack",                   slug: "min-stack",                   platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/min-stack/" },
    { title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
    { title: "Generate Parentheses",        slug: "generate-parentheses",        platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/generate-parentheses/" },
    { title: "Daily Temperatures",          slug: "daily-temperatures",          platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/daily-temperatures/" },
    { title: "Asteroid Collision",          slug: "asteroid-collision",          platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/asteroid-collision/" },
    { title: "Maximal Rectangle",           slug: "maximal-rectangle",           platform: "LEETCODE", topic: "Stack", difficulty: "HARD",   url: "https://leetcode.com/problems/maximal-rectangle/" },
    { title: "The Number of Visible People in a Queue", slug: "the-number-of-visible-people-in-a-queue", platform: "LEETCODE", topic: "Stack", difficulty: "HARD", url: "https://leetcode.com/problems/the-number-of-visible-people-in-a-queue/" },
    { title: "Remove Invalid Parentheses",  slug: "remove-invalid-parentheses",  platform: "LEETCODE", topic: "Stack", difficulty: "HARD",   url: "https://leetcode.com/problems/remove-invalid-parentheses/" },
    { title: "Maximum Frequency Stack",     slug: "maximum-frequency-stack",     platform: "LEETCODE", topic: "Stack", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-frequency-stack/" },
    { title: "Car Fleet II",                slug: "car-fleet-ii",                platform: "LEETCODE", topic: "Stack", difficulty: "HARD",   url: "https://leetcode.com/problems/car-fleet-ii/" },

    // ─── LINKED LIST ─────────────────────────────────────────────────────────────
    { title: "Reverse Linked List",                   slug: "reverse-linked-list",                   platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/reverse-linked-list/" },
    { title: "Merge Two Sorted Lists",                slug: "merge-two-sorted-lists",                platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
    { title: "Linked List Cycle",                     slug: "linked-list-cycle",                     platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/linked-list-cycle/" },
    { title: "Middle of the Linked List",             slug: "middle-of-the-linked-list",             platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/middle-of-the-linked-list/" },
    { title: "Delete Node in a Linked List",          slug: "delete-node-in-a-linked-list",          platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/delete-node-in-a-linked-list/" },
    { title: "Remove Nth Node From End of List",      slug: "remove-nth-node-from-end-of-list",      platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
    { title: "Add Two Numbers",                       slug: "add-two-numbers",                       platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/add-two-numbers/" },
    { title: "Odd Even Linked List",                  slug: "odd-even-linked-list",                  platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/odd-even-linked-list/" },
    { title: "Reorder List",                          slug: "reorder-list",                          platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/reorder-list/" },
    { title: "Copy List with Random Pointer",         slug: "copy-list-with-random-pointer",         platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/copy-list-with-random-pointer/" },
    { title: "Reverse Nodes in k-Group",              slug: "reverse-nodes-in-k-group",              platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
    { title: "Merge k Sorted Lists",                  slug: "merge-k-sorted-lists",                  platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
    { title: "LFU Cache",                             slug: "lfu-cache",                             platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/lfu-cache/" },
    { title: "Design Skiplist",                       slug: "design-skiplist",                       platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/design-skiplist/" },
    { title: "Design a Text Editor",                  slug: "design-a-text-editor",                  platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/design-a-text-editor/" },

    // ─── TREE ────────────────────────────────────────────────────────────────────
    { title: "Maximum Depth of Binary Tree",             slug: "maximum-depth-of-binary-tree",             platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
    { title: "Invert Binary Tree",                       slug: "invert-binary-tree",                       platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/invert-binary-tree/" },
    { title: "Same Tree",                                slug: "same-tree",                                platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/same-tree/" },
    { title: "Symmetric Tree",                           slug: "symmetric-tree",                           platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/symmetric-tree/" },
    { title: "Path Sum",                                 slug: "path-sum",                                 platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/path-sum/" },
    { title: "Binary Tree Level Order Traversal",        slug: "binary-tree-level-order-traversal",        platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
    { title: "Validate Binary Search Tree",              slug: "validate-binary-search-tree",              platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
    { title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
    { title: "Lowest Common Ancestor of a Binary Tree",  slug: "lowest-common-ancestor-of-a-binary-tree",  platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
    { title: "Kth Smallest Element in a BST",            slug: "kth-smallest-element-in-a-bst",            platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
    { title: "Serialize and Deserialize Binary Tree",    slug: "serialize-and-deserialize-binary-tree",    platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },
    { title: "Binary Tree Maximum Path Sum",             slug: "binary-tree-maximum-path-sum",             platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
    { title: "Recover Binary Search Tree",               slug: "recover-binary-search-tree",               platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/recover-binary-search-tree/" },
    { title: "Vertical Order Traversal of a Binary Tree",slug: "vertical-order-traversal-of-a-binary-tree",platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/" },
    { title: "Binary Tree Cameras",                      slug: "binary-tree-cameras",                      platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/binary-tree-cameras/" },

    // ─── HEAP (PRIORITY QUEUE) ───────────────────────────────────────────────────
    { title: "Last Stone Weight",                slug: "last-stone-weight",                platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/last-stone-weight/" },
    { title: "Kth Largest Element in a Stream",  slug: "kth-largest-element-in-a-stream",  platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" },
    { title: "Relative Ranks",                   slug: "relative-ranks",                   platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/relative-ranks/" },
    { title: "Smallest Number in Infinite Set",  slug: "smallest-number-in-infinite-set",  platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/smallest-number-in-infinite-set/" },
    { title: "Reduce Array Size to The Half",    slug: "reduce-array-size-to-the-half",    platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/reduce-array-size-to-the-half/" },
    { title: "Task Scheduler",                   slug: "task-scheduler",                   platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/task-scheduler/" },
    { title: "Reorganize String",                slug: "reorganize-string",                platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/reorganize-string/" },
    { title: "K Closest Points to Origin",       slug: "k-closest-points-to-origin",       platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/k-closest-points-to-origin/" },
    { title: "Top K Frequent Words",             slug: "top-k-frequent-words",             platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/top-k-frequent-words/" },
    { title: "Process Tasks Using Servers",      slug: "process-tasks-using-servers",      platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/process-tasks-using-servers/" },
    { title: "Find Median from Data Stream",     slug: "find-median-from-data-stream",     platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/find-median-from-data-stream/" },
    { title: "Minimum Cost to Hire K Workers",   slug: "minimum-cost-to-hire-k-workers",   platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-cost-to-hire-k-workers/" },
    { title: "Maximum Performance of a Team",    slug: "maximum-performance-of-a-team",    platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-performance-of-a-team/" },
    { title: "K-th Smallest Prime Fraction",     slug: "k-th-smallest-prime-fraction",     platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/k-th-smallest-prime-fraction/" },
    { title: "IPO",                              slug: "ipo",                              platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/ipo/" },

    // ─── GRAPH ───────────────────────────────────────────────────────────────────
    { title: "Find the Town Judge",              slug: "find-the-town-judge",              platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/find-the-town-judge/" },
    { title: "Find Center of Star Graph",        slug: "find-center-of-star-graph",        platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/find-center-of-star-graph/" },
    { title: "Find if Path Exists in Graph",     slug: "find-if-path-exists-in-graph",     platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/find-if-path-exists-in-graph/" },
    { title: "Flower Planting With No Adjacent", slug: "flower-planting-with-no-adjacent", platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/flower-planting-with-no-adjacent/" },
    { title: "Number of Provinces",              slug: "number-of-provinces",              platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/number-of-provinces/" },
    { title: "Number of Islands",                slug: "number-of-islands",                platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/number-of-islands/" },
    { title: "Course Schedule",                  slug: "course-schedule",                  platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/course-schedule/" },
    { title: "Course Schedule II",               slug: "course-schedule-ii",               platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/course-schedule-ii/" },
    { title: "Network Delay Time",               slug: "network-delay-time",               platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/network-delay-time/" },
    { title: "Min Cost to Connect All Points",   slug: "min-cost-to-connect-all-points",   platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/min-cost-to-connect-all-points/" },
    { title: "Critical Connections in a Network",slug: "critical-connections-in-a-network",platform: "LEETCODE", topic: "Graph", difficulty: "HARD",   url: "https://leetcode.com/problems/critical-connections-in-a-network/" },
    { title: "Word Ladder",                      slug: "word-ladder",                      platform: "LEETCODE", topic: "Graph", difficulty: "HARD",   url: "https://leetcode.com/problems/word-ladder/" },
    { title: "Reconstruct Itinerary",            slug: "reconstruct-itinerary",            platform: "LEETCODE", topic: "Graph", difficulty: "HARD",   url: "https://leetcode.com/problems/reconstruct-itinerary/" },
    { title: "Number of Good Paths",             slug: "number-of-good-paths",             platform: "LEETCODE", topic: "Graph", difficulty: "HARD",   url: "https://leetcode.com/problems/number-of-good-paths/" },
    { title: "Minimum Cost to Reach Destination in Time", slug: "minimum-cost-to-reach-destination-in-time", platform: "LEETCODE", topic: "Graph", difficulty: "HARD", url: "https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/" },

    // ─── BACKTRACKING ────────────────────────────────────────────────────────────
    { title: "Letter Case Permutation",        slug: "letter-case-permutation",        platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY",   url: "https://leetcode.com/problems/letter-case-permutation/" },
    { title: "Binary Watch",                   slug: "binary-watch",                   platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY",   url: "https://leetcode.com/problems/binary-watch/" },
    { title: "Find All Possible Recipes from Given Supplies", slug: "find-all-possible-recipes-from-given-supplies", platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY", url: "https://leetcode.com/problems/find-all-possible-recipes-from-given-supplies/" },
    { title: "Check if There is a Valid Parentheses String Path", slug: "check-if-there-is-a-valid-parentheses-string-path", platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY", url: "https://leetcode.com/problems/check-if-there-is-a-valid-parentheses-string-path/" },
    { title: "Count Number of Texts",          slug: "count-number-of-texts",          platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY",   url: "https://leetcode.com/problems/count-number-of-texts/" },
    { title: "Permutations",                   slug: "permutations",                   platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/permutations/" },
    { title: "Subsets",                        slug: "subsets",                        platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/subsets/" },
    { title: "Combination Sum",                slug: "combination-sum",                platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/combination-sum/" },
    { title: "Word Search",                    slug: "word-search",                    platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/word-search/" },
    { title: "Palindrome Partitioning",        slug: "palindrome-partitioning",        platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/palindrome-partitioning/" },
    { title: "N-Queens",                       slug: "n-queens",                       platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/n-queens/" },
    { title: "Sudoku Solver",                  slug: "sudoku-solver",                  platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/sudoku-solver/" },
    { title: "Word Search II",                 slug: "word-search-ii",                 platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/word-search-ii/" },
    { title: "Remove Boxes",                   slug: "remove-boxes",                   platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/remove-boxes/" },
    { title: "Zuma Game",                      slug: "zuma-game",                      platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/zuma-game/" },

    // ─── DYNAMIC PROGRAMMING ─────────────────────────────────────────────────────
    { title: "Climbing Stairs",                       slug: "climbing-stairs",                       platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/climbing-stairs/" },
    { title: "Pascal's Triangle",                     slug: "pascals-triangle",                      platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/pascals-triangle/" },
    { title: "Min Cost Climbing Stairs",              slug: "min-cost-climbing-stairs",              platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/min-cost-climbing-stairs/" },
    { title: "N-th Tribonacci Number",                slug: "n-th-tribonacci-number",                platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/n-th-tribonacci-number/" },
    { title: "Maximum Alternating Subsequence Sum",   slug: "maximum-alternating-subsequence-sum",   platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/maximum-alternating-subsequence-sum/" },
    { title: "House Robber",                          slug: "house-robber",                          platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/house-robber/" },
    { title: "Coin Change",                           slug: "coin-change",                           platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/coin-change/" },
    { title: "Longest Increasing Subsequence",        slug: "longest-increasing-subsequence",        platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
    { title: "Unique Paths",                          slug: "unique-paths",                          platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/unique-paths/" },
    { title: "Partition Equal Subset Sum",            slug: "partition-equal-subset-sum",            platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/partition-equal-subset-sum/" },
    { title: "Edit Distance",                         slug: "edit-distance",                         platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/edit-distance/" },
    { title: "Burst Balloons",                        slug: "burst-balloons",                        platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/burst-balloons/" },
    { title: "Minimum Window Subsequence",            slug: "minimum-window-subsequence",            platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-window-subsequence/" },
    { title: "Longest Common Subsequence",            slug: "longest-common-subsequence",            platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/longest-common-subsequence/" },
    { title: "Strange Printer",                       slug: "strange-printer",                       platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/strange-printer/" },

    // ─── GREEDY ──────────────────────────────────────────────────────────────────
    { title: "Assign Cookies",                        slug: "assign-cookies",                        platform: "LEETCODE", topic: "Greedy", difficulty: "EASY",   url: "https://leetcode.com/problems/assign-cookies/" },
    { title: "Lemonade Change",                       slug: "lemonade-change",                       platform: "LEETCODE", topic: "Greedy", difficulty: "EASY",   url: "https://leetcode.com/problems/lemonade-change/" },
    { title: "Can Place Flowers",                     slug: "can-place-flowers",                     platform: "LEETCODE", topic: "Greedy", difficulty: "EASY",   url: "https://leetcode.com/problems/can-place-flowers/" },
    { title: "Maximum Units on a Truck",              slug: "maximum-units-on-a-truck",              platform: "LEETCODE", topic: "Greedy", difficulty: "EASY",   url: "https://leetcode.com/problems/maximum-units-on-a-truck/" },
    { title: "Partition Array into Three Parts With Equal Sum", slug: "partition-array-into-three-parts-with-equal-sum", platform: "LEETCODE", topic: "Greedy", difficulty: "EASY", url: "https://leetcode.com/problems/partition-array-into-three-parts-with-equal-sum/" },
    { title: "Jump Game",                             slug: "jump-game",                             platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/jump-game/" },
    { title: "Gas Station",                           slug: "gas-station",                           platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/gas-station/" },
    { title: "Merge Intervals",                       slug: "merge-intervals",                       platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/merge-intervals/" },
    { title: "Non-overlapping Intervals",             slug: "non-overlapping-intervals",             platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/non-overlapping-intervals/" },
    { title: "Minimum Number of Arrows to Burst Balloons", slug: "minimum-number-of-arrows-to-burst-balloons", platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/" },
    { title: "Candy",                                 slug: "candy",                                 platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/candy/" },
    { title: "Jump Game II",                          slug: "jump-game-ii",                          platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/jump-game-ii/" },
    { title: "Remove Duplicate Letters",              slug: "remove-duplicate-letters",              platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/remove-duplicate-letters/" },
    { title: "Create Maximum Number",                 slug: "create-maximum-number",                 platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/create-maximum-number/" },
    { title: "Minimum Cost to Hire K Workers",        slug: "minimum-cost-to-hire-k-workers-greedy", platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-cost-to-hire-k-workers/" },

    // ─── BIT MANIPULATION ────────────────────────────────────────────────────────
    { title: "Single Number",                         slug: "single-number",                         platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/single-number/" },
    { title: "Number of 1 Bits",                      slug: "number-of-1-bits",                      platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/number-of-1-bits/" },
    { title: "Counting Bits",                         slug: "counting-bits",                         platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/counting-bits/" },
    { title: "Reverse Bits",                          slug: "reverse-bits",                          platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/reverse-bits/" },
    { title: "Power of Two",                          slug: "power-of-two",                          platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/power-of-two/" },
    { title: "Missing Number",                        slug: "missing-number",                        platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/missing-number/" },
    { title: "Sum of Two Integers",                   slug: "sum-of-two-integers",                   platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/sum-of-two-integers/" },
    { title: "Bitwise AND of Numbers Range",          slug: "bitwise-and-of-numbers-range",          platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/bitwise-and-of-numbers-range/" },
    { title: "Maximum XOR of Two Numbers in an Array",slug: "maximum-xor-of-two-numbers-in-an-array",platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
    { title: "Single Number II",                      slug: "single-number-ii",                      platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/single-number-ii/" },
    { title: "Maximum Product of Word Lengths",       slug: "maximum-product-of-word-lengths",       platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-product-of-word-lengths/" },
    { title: "Total Hamming Distance",                slug: "total-hamming-distance",                platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD",   url: "https://leetcode.com/problems/total-hamming-distance/" },
    { title: "Minimum One Bit Operations to Make Integers Zero", slug: "minimum-one-bit-operations-to-make-integers-zero", platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD", url: "https://leetcode.com/problems/minimum-one-bit-operations-to-make-integers-zero/" },
    { title: "Maximum XOR With an Element From Array",slug: "maximum-xor-with-an-element-from-array",platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/" },
    { title: "Concatenation of Consecutive Binary Numbers", slug: "concatenation-of-consecutive-binary-numbers", platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD", url: "https://leetcode.com/problems/concatenation-of-consecutive-binary-numbers/" },
];

async function seed() {
    console.log(`Seeding ${problems.length} problems across 18 topics...`);

    let created = 0;
    let updated = 0;

    for (const problem of problems) {
        const existing = await prisma.problem.findFirst({
            where: { slug: problem.slug, platform: problem.platform },
        });

        if (existing) {
            await prisma.problem.update({
                where: { id: existing.id },
                data: {
                    title:      problem.title,
                    topic:      problem.topic,
                    difficulty: problem.difficulty,
                    url:        problem.url,
                },
            });
            updated++;
        } else {
            await prisma.problem.create({ data: problem });
            created++;
        }
    }

    const count = await prisma.problem.count();
    console.log(`✓ Done — ${created} created, ${updated} updated. Problem bank has ${count} total problems.`);
}

seed()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error("Seed failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
