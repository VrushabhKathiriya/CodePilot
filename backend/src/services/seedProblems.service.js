import prisma from "../config/prisma.js";

// 255 problems across 18 DSA topics
// Topic names match LeetCode's official tagName values exactly (used by recommendation engine)
const problems = [
    // ── ARRAY ────────────────────────────────────────────────────────────────
    { title: "Two Sum",                                   slug: "two-sum",                                   platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/two-sum/" },
    { title: "Best Time to Buy and Sell Stock",           slug: "best-time-to-buy-and-sell-stock",           platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
    { title: "Contains Duplicate",                        slug: "contains-duplicate",                        platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/contains-duplicate/" },
    { title: "Maximum Subarray",                          slug: "maximum-subarray",                          platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/maximum-subarray/" },
    { title: "Move Zeroes",                               slug: "move-zeroes",                               platform: "LEETCODE", topic: "Array", difficulty: "EASY",   url: "https://leetcode.com/problems/move-zeroes/" },
    { title: "Product of Array Except Self",              slug: "product-of-array-except-self",              platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/product-of-array-except-self/" },
    { title: "Maximum Product Subarray",                  slug: "maximum-product-subarray",                  platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/maximum-product-subarray/" },
    { title: "Container With Most Water",                 slug: "container-with-most-water",                 platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/container-with-most-water/" },
    { title: "Rotate Array",                              slug: "rotate-array",                              platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/rotate-array/" },
    { title: "Set Matrix Zeroes",                         slug: "set-matrix-zeroes",                         platform: "LEETCODE", topic: "Array", difficulty: "MEDIUM", url: "https://leetcode.com/problems/set-matrix-zeroes/" },
    { title: "Trapping Rain Water",                       slug: "trapping-rain-water",                       platform: "LEETCODE", topic: "Array", difficulty: "HARD",   url: "https://leetcode.com/problems/trapping-rain-water/" },
    { title: "First Missing Positive",                    slug: "first-missing-positive",                    platform: "LEETCODE", topic: "Array", difficulty: "HARD",   url: "https://leetcode.com/problems/first-missing-positive/" },
    { title: "Largest Rectangle in Histogram",            slug: "largest-rectangle-in-histogram",            platform: "LEETCODE", topic: "Array", difficulty: "HARD",   url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
    { title: "Maximum Gap",                               slug: "maximum-gap",                               platform: "LEETCODE", topic: "Array", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-gap/" },
    { title: "Max Sum of Rectangle No Larger Than K",     slug: "max-sum-of-rectangle-no-larger-than-k",     platform: "LEETCODE", topic: "Array", difficulty: "HARD",   url: "https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/" },

    // ── STRING ───────────────────────────────────────────────────────────────
    { title: "Valid Anagram",                             slug: "valid-anagram",                             platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/valid-anagram/" },
    { title: "Longest Common Prefix",                     slug: "longest-common-prefix",                     platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/longest-common-prefix/" },
    { title: "Reverse String",                            slug: "reverse-string",                            platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/reverse-string/" },
    { title: "First Unique Character in a String",        slug: "first-unique-character-in-a-string",        platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/first-unique-character-in-a-string/" },
    { title: "Add Binary",                                slug: "add-binary",                                platform: "LEETCODE", topic: "String", difficulty: "EASY",   url: "https://leetcode.com/problems/add-binary/" },
    { title: "Longest Palindromic Substring",             slug: "longest-palindromic-substring",             platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-palindromic-substring/" },
    { title: "Group Anagrams",                            slug: "group-anagrams",                            platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/group-anagrams/" },
    { title: "String to Integer (atoi)",                  slug: "string-to-integer-atoi",                    platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/string-to-integer-atoi/" },
    { title: "Decode String",                             slug: "decode-string",                             platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/decode-string/" },
    { title: "Zigzag Conversion",                         slug: "zigzag-conversion",                         platform: "LEETCODE", topic: "String", difficulty: "MEDIUM", url: "https://leetcode.com/problems/zigzag-conversion/" },
    { title: "Minimum Window Substring",                  slug: "minimum-window-substring",                  platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-window-substring/" },
    { title: "Regular Expression Matching",               slug: "regular-expression-matching",               platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/regular-expression-matching/" },
    { title: "Wildcard Matching",                         slug: "wildcard-matching",                         platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/wildcard-matching/" },
    { title: "Longest Valid Parentheses",                 slug: "longest-valid-parentheses",                 platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/longest-valid-parentheses/" },
    { title: "Text Justification",                        slug: "text-justification",                        platform: "LEETCODE", topic: "String", difficulty: "HARD",   url: "https://leetcode.com/problems/text-justification/" },

    // ── HASH TABLE ───────────────────────────────────────────────────────────
    { title: "Ransom Note",                               slug: "ransom-note",                               platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/ransom-note/" },
    { title: "Isomorphic Strings",                        slug: "isomorphic-strings",                        platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/isomorphic-strings/" },
    { title: "Word Pattern",                              slug: "word-pattern",                              platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/word-pattern/" },
    { title: "Happy Number",                              slug: "happy-number",                              platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/happy-number/" },
    { title: "Majority Element",                          slug: "majority-element",                          platform: "LEETCODE", topic: "Hash Table", difficulty: "EASY",   url: "https://leetcode.com/problems/majority-element/" },
    { title: "Top K Frequent Elements",                   slug: "top-k-frequent-elements",                   platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
    { title: "Longest Consecutive Sequence",              slug: "longest-consecutive-sequence",              platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-consecutive-sequence/" },
    { title: "Find All Anagrams in a String",             slug: "find-all-anagrams-in-a-string",             platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" },
    { title: "4Sum II",                                   slug: "4sum-ii",                                   platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/4sum-ii/" },
    { title: "LRU Cache",                                 slug: "lru-cache",                                 platform: "LEETCODE", topic: "Hash Table", difficulty: "MEDIUM", url: "https://leetcode.com/problems/lru-cache/" },
    { title: "Substring with Concatenation of All Words", slug: "substring-with-concatenation-of-all-words", platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/" },
    { title: "Max Points on a Line",                      slug: "max-points-on-a-line",                      platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/max-points-on-a-line/" },
    { title: "All O`one Data Structure",                  slug: "all-oone-data-structure",                   platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/all-oone-data-structure/" },
    { title: "Number of Atoms",                           slug: "number-of-atoms",                           platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/number-of-atoms/" },
    { title: "Palindrome Pairs",                          slug: "palindrome-pairs",                          platform: "LEETCODE", topic: "Hash Table", difficulty: "HARD",   url: "https://leetcode.com/problems/palindrome-pairs/" },

    // ── MATH ─────────────────────────────────────────────────────────────────
    { title: "Palindrome Number",                         slug: "palindrome-number",                         platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/palindrome-number/" },
    { title: "Roman to Integer",                          slug: "roman-to-integer",                          platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/roman-to-integer/" },
    { title: "Fizz Buzz",                                 slug: "fizz-buzz",                                 platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/fizz-buzz/" },
    { title: "Count Primes",                              slug: "count-primes",                              platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/count-primes/" },
    { title: "Power of Two",                              slug: "power-of-two",                              platform: "LEETCODE", topic: "Math", difficulty: "EASY",   url: "https://leetcode.com/problems/power-of-two/" },
    { title: "Reverse Integer",                           slug: "reverse-integer",                           platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/reverse-integer/" },
    { title: "Pow(x, n)",                                 slug: "powx-n",                                    platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/powx-n/" },
    { title: "Multiply Strings",                          slug: "multiply-strings",                          platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/multiply-strings/" },
    { title: "Fraction to Recurring Decimal",             slug: "fraction-to-recurring-decimal",             platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/fraction-to-recurring-decimal/" },
    { title: "Excel Sheet Column Number",                 slug: "excel-sheet-column-number",                 platform: "LEETCODE", topic: "Math", difficulty: "MEDIUM", url: "https://leetcode.com/problems/excel-sheet-column-number/" },
    { title: "Integer to English Words",                  slug: "integer-to-english-words",                  platform: "LEETCODE", topic: "Math", difficulty: "HARD",   url: "https://leetcode.com/problems/integer-to-english-words/" },
    { title: "Basic Calculator",                          slug: "basic-calculator",                          platform: "LEETCODE", topic: "Math", difficulty: "HARD",   url: "https://leetcode.com/problems/basic-calculator/" },
    { title: "Largest Number",                            slug: "largest-number",                            platform: "LEETCODE", topic: "Math", difficulty: "HARD",   url: "https://leetcode.com/problems/largest-number/" },
    { title: "Nth Digit",                                 slug: "nth-digit",                                 platform: "LEETCODE", topic: "Math", difficulty: "HARD",   url: "https://leetcode.com/problems/nth-digit/" },
    { title: "Minimum Number of Operations to Make Array Continuous", slug: "minimum-number-of-operations-to-make-array-continuous", platform: "LEETCODE", topic: "Math", difficulty: "HARD", url: "https://leetcode.com/problems/minimum-number-of-operations-to-make-array-continuous/" },

    // ── SORTING ──────────────────────────────────────────────────────────────
    { title: "Sort Colors",                               slug: "sort-colors",                               platform: "LEETCODE", topic: "Sorting", difficulty: "EASY",   url: "https://leetcode.com/problems/sort-colors/" },
    { title: "Merge Sorted Array",                        slug: "merge-sorted-array",                        platform: "LEETCODE", topic: "Sorting", difficulty: "EASY",   url: "https://leetcode.com/problems/merge-sorted-array/" },
    { title: "Intersection of Two Arrays",                slug: "intersection-of-two-arrays",                platform: "LEETCODE", topic: "Sorting", difficulty: "EASY",   url: "https://leetcode.com/problems/intersection-of-two-arrays/" },
    { title: "Squares of a Sorted Array",                 slug: "squares-of-a-sorted-array",                 platform: "LEETCODE", topic: "Sorting", difficulty: "EASY",   url: "https://leetcode.com/problems/squares-of-a-sorted-array/" },
    { title: "Third Maximum Number",                      slug: "third-maximum-number",                      platform: "LEETCODE", topic: "Sorting", difficulty: "EASY",   url: "https://leetcode.com/problems/third-maximum-number/" },
    { title: "Kth Largest Element in an Array",           slug: "kth-largest-element-in-an-array",           platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
    { title: "Sort an Array",                             slug: "sort-an-array",                             platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/sort-an-array/" },
    { title: "Wiggle Sort II",                            slug: "wiggle-sort-ii",                            platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/wiggle-sort-ii/" },
    { title: "Largest Number",                            slug: "largest-number-sort",                       platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/largest-number/" },
    { title: "Meeting Rooms II",                          slug: "meeting-rooms-ii",                          platform: "LEETCODE", topic: "Sorting", difficulty: "MEDIUM", url: "https://leetcode.com/problems/meeting-rooms-ii/" },
    { title: "Count of Smaller Numbers After Self",       slug: "count-of-smaller-numbers-after-self",       platform: "LEETCODE", topic: "Sorting", difficulty: "HARD",   url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/" },
    { title: "Merge k Sorted Lists",                      slug: "merge-k-sorted-lists",                      platform: "LEETCODE", topic: "Sorting", difficulty: "HARD",   url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
    { title: "Maximum Gap",                               slug: "maximum-gap-sort",                          platform: "LEETCODE", topic: "Sorting", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-gap/" },
    { title: "Reverse Pairs",                             slug: "reverse-pairs",                             platform: "LEETCODE", topic: "Sorting", difficulty: "HARD",   url: "https://leetcode.com/problems/reverse-pairs/" },
    { title: "Count of Range Sum",                        slug: "count-of-range-sum",                        platform: "LEETCODE", topic: "Sorting", difficulty: "HARD",   url: "https://leetcode.com/problems/count-of-range-sum/" },

    // ── TWO POINTERS ─────────────────────────────────────────────────────────
    { title: "Valid Palindrome",                          slug: "valid-palindrome",                          platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/valid-palindrome/" },
    { title: "Remove Duplicates from Sorted Array",       slug: "remove-duplicates-from-sorted-array",       platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
    { title: "Remove Element",                            slug: "remove-element",                            platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/remove-element/" },
    { title: "Squares of a Sorted Array",                 slug: "squares-of-a-sorted-array-tp",              platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/squares-of-a-sorted-array/" },
    { title: "Reverse String",                            slug: "reverse-string-tp",                         platform: "LEETCODE", topic: "Two Pointers", difficulty: "EASY",   url: "https://leetcode.com/problems/reverse-string/" },
    { title: "3Sum",                                      slug: "3sum",                                      platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/3sum/" },
    { title: "Container With Most Water",                 slug: "container-with-most-water-tp",              platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/container-with-most-water/" },
    { title: "Boats to Save People",                      slug: "boats-to-save-people",                      platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/boats-to-save-people/" },
    { title: "4Sum",                                      slug: "4sum",                                      platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/4sum/" },
    { title: "3Sum Closest",                              slug: "3sum-closest",                              platform: "LEETCODE", topic: "Two Pointers", difficulty: "MEDIUM", url: "https://leetcode.com/problems/3sum-closest/" },
    { title: "Trapping Rain Water",                       slug: "trapping-rain-water-tp",                    platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD",   url: "https://leetcode.com/problems/trapping-rain-water/" },
    { title: "Minimum Window Substring",                  slug: "minimum-window-substring-tp",               platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-window-substring/" },
    { title: "Substring with Concatenation of All Words", slug: "substring-with-concatenation-tp",           platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD",   url: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/" },
    { title: "Number of Visible People in a Queue",       slug: "number-of-visible-people-in-a-queue",       platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD",   url: "https://leetcode.com/problems/number-of-visible-people-in-a-queue/" },
    { title: "Minimum Operations to Reduce X to Zero",    slug: "minimum-operations-to-reduce-x-to-zero",    platform: "LEETCODE", topic: "Two Pointers", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/" },

    // ── SLIDING WINDOW ───────────────────────────────────────────────────────
    { title: "Maximum Average Subarray I",                slug: "maximum-average-subarray-i",                platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/maximum-average-subarray-i/" },
    { title: "Contains Duplicate II",                     slug: "contains-duplicate-ii",                     platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/contains-duplicate-ii/" },
    { title: "Find All Anagrams in a String",             slug: "find-all-anagrams-sw",                      platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" },
    { title: "Longest Turbulent Subarray",                slug: "longest-turbulent-subarray",                platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/longest-turbulent-subarray/" },
    { title: "Diet Plan Performance",                     slug: "diet-plan-performance",                     platform: "LEETCODE", topic: "Sliding Window", difficulty: "EASY",   url: "https://leetcode.com/problems/diet-plan-performance/" },
    { title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
    { title: "Minimum Size Subarray Sum",                 slug: "minimum-size-subarray-sum",                 platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
    { title: "Longest Repeating Character Replacement",   slug: "longest-repeating-character-replacement",   platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
    { title: "Permutation in String",                     slug: "permutation-in-string",                     platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/permutation-in-string/" },
    { title: "Fruit Into Baskets",                        slug: "fruit-into-baskets",                        platform: "LEETCODE", topic: "Sliding Window", difficulty: "MEDIUM", url: "https://leetcode.com/problems/fruit-into-baskets/" },
    { title: "Minimum Window Substring",                  slug: "minimum-window-substring-sw",               platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-window-substring/" },
    { title: "Sliding Window Maximum",                    slug: "sliding-window-maximum",                    platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/sliding-window-maximum/" },
    { title: "Substring with Concatenation of All Words", slug: "substring-with-concatenation-sw",           platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/" },
    { title: "Minimum Number of K Consecutive Bit Flips", slug: "minimum-number-of-k-consecutive-bit-flips", platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-number-of-k-consecutive-bit-flips/" },
    { title: "Count Subarrays With Fixed Bounds",         slug: "count-subarrays-with-fixed-bounds",         platform: "LEETCODE", topic: "Sliding Window", difficulty: "HARD",   url: "https://leetcode.com/problems/count-subarrays-with-fixed-bounds/" },

    // ── BINARY SEARCH ────────────────────────────────────────────────────────
    { title: "Binary Search",                             slug: "binary-search",                             platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/binary-search/" },
    { title: "Search Insert Position",                    slug: "search-insert-position",                    platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/search-insert-position/" },
    { title: "First Bad Version",                         slug: "first-bad-version",                         platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/first-bad-version/" },
    { title: "Guess Number Higher or Lower",              slug: "guess-number-higher-or-lower",              platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/guess-number-higher-or-lower/" },
    { title: "Sqrt(x)",                                   slug: "sqrtx",                                     platform: "LEETCODE", topic: "Binary Search", difficulty: "EASY",   url: "https://leetcode.com/problems/sqrtx/" },
    { title: "Search in Rotated Sorted Array",            slug: "search-in-rotated-sorted-array",            platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
    { title: "Find Minimum in Rotated Sorted Array",      slug: "find-minimum-in-rotated-sorted-array",      platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
    { title: "Search a 2D Matrix",                        slug: "search-a-2d-matrix",                        platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/search-a-2d-matrix/" },
    { title: "Koko Eating Bananas",                       slug: "koko-eating-bananas",                       platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/koko-eating-bananas/" },
    { title: "Time Based Key-Value Store",                slug: "time-based-key-value-store",                platform: "LEETCODE", topic: "Binary Search", difficulty: "MEDIUM", url: "https://leetcode.com/problems/time-based-key-value-store/" },
    { title: "Median of Two Sorted Arrays",               slug: "median-of-two-sorted-arrays",               platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD",   url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
    { title: "Find in Mountain Array",                    slug: "find-in-mountain-array",                    platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD",   url: "https://leetcode.com/problems/find-in-mountain-array/" },
    { title: "Split Array Largest Sum",                   slug: "split-array-largest-sum",                   platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD",   url: "https://leetcode.com/problems/split-array-largest-sum/" },
    { title: "Find K-th Smallest Pair Distance",          slug: "find-k-th-smallest-pair-distance",          platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD",   url: "https://leetcode.com/problems/find-k-th-smallest-pair-distance/" },
    { title: "Russian Doll Envelopes",                    slug: "russian-doll-envelopes",                    platform: "LEETCODE", topic: "Binary Search", difficulty: "HARD",   url: "https://leetcode.com/problems/russian-doll-envelopes/" },

    // ── STACK ────────────────────────────────────────────────────────────────
    { title: "Valid Parentheses",                         slug: "valid-parentheses",                         platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/valid-parentheses/" },
    { title: "Min Stack",                                 slug: "min-stack",                                 platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/min-stack/" },
    { title: "Baseball Game",                             slug: "baseball-game",                             platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/baseball-game/" },
    { title: "Implement Queue using Stacks",              slug: "implement-queue-using-stacks",              platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/implement-queue-using-stacks/" },
    { title: "Backspace String Compare",                  slug: "backspace-string-compare",                  platform: "LEETCODE", topic: "Stack", difficulty: "EASY",   url: "https://leetcode.com/problems/backspace-string-compare/" },
    { title: "Daily Temperatures",                        slug: "daily-temperatures",                        platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/daily-temperatures/" },
    { title: "Decode String",                             slug: "decode-string-stack",                       platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/decode-string/" },
    { title: "Asteroid Collision",                        slug: "asteroid-collision",                        platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/asteroid-collision/" },
    { title: "Online Stock Span",                         slug: "online-stock-span",                         platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/online-stock-span/" },
    { title: "Next Greater Element II",                   slug: "next-greater-element-ii",                   platform: "LEETCODE", topic: "Stack", difficulty: "MEDIUM", url: "https://leetcode.com/problems/next-greater-element-ii/" },
    { title: "Largest Rectangle in Histogram",            slug: "largest-rectangle-in-histogram-stack",      platform: "LEETCODE", topic: "Stack", difficulty: "HARD",   url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
    { title: "Maximal Rectangle",                         slug: "maximal-rectangle",                         platform: "LEETCODE", topic: "Stack", difficulty: "HARD",   url: "https://leetcode.com/problems/maximal-rectangle/" },
    { title: "Basic Calculator",                          slug: "basic-calculator-stack",                    platform: "LEETCODE", topic: "Stack", difficulty: "HARD",   url: "https://leetcode.com/problems/basic-calculator/" },
    { title: "Trapping Rain Water",                       slug: "trapping-rain-water-stack",                 platform: "LEETCODE", topic: "Stack", difficulty: "HARD",   url: "https://leetcode.com/problems/trapping-rain-water/" },
    { title: "Remove Duplicate Letters",                  slug: "remove-duplicate-letters",                  platform: "LEETCODE", topic: "Stack", difficulty: "HARD",   url: "https://leetcode.com/problems/remove-duplicate-letters/" },

    // ── LINKED LIST ──────────────────────────────────────────────────────────
    { title: "Reverse Linked List",                       slug: "reverse-linked-list",                       platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/reverse-linked-list/" },
    { title: "Merge Two Sorted Lists",                    slug: "merge-two-sorted-lists",                    platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
    { title: "Linked List Cycle",                         slug: "linked-list-cycle",                         platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/linked-list-cycle/" },
    { title: "Remove Linked List Elements",               slug: "remove-linked-list-elements",               platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/remove-linked-list-elements/" },
    { title: "Palindrome Linked List",                    slug: "palindrome-linked-list",                    platform: "LEETCODE", topic: "Linked List", difficulty: "EASY",   url: "https://leetcode.com/problems/palindrome-linked-list/" },
    { title: "Add Two Numbers",                           slug: "add-two-numbers",                           platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/add-two-numbers/" },
    { title: "Remove Nth Node From End of List",          slug: "remove-nth-node-from-end-of-list",          platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
    { title: "Reorder List",                              slug: "reorder-list",                              platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/reorder-list/" },
    { title: "Copy List with Random Pointer",             slug: "copy-list-with-random-pointer",             platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/copy-list-with-random-pointer/" },
    { title: "LRU Cache",                                 slug: "lru-cache-ll",                              platform: "LEETCODE", topic: "Linked List", difficulty: "MEDIUM", url: "https://leetcode.com/problems/lru-cache/" },
    { title: "Merge k Sorted Lists",                      slug: "merge-k-sorted-lists-ll",                   platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
    { title: "Reverse Nodes in k-Group",                  slug: "reverse-nodes-in-k-group",                  platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
    { title: "Sort List",                                 slug: "sort-list",                                 platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/sort-list/" },
    { title: "Find the Duplicate Number",                 slug: "find-the-duplicate-number",                 platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/find-the-duplicate-number/" },
    { title: "Design Linked List",                        slug: "design-linked-list",                        platform: "LEETCODE", topic: "Linked List", difficulty: "HARD",   url: "https://leetcode.com/problems/design-linked-list/" },

    // ── TREE ─────────────────────────────────────────────────────────────────
    { title: "Maximum Depth of Binary Tree",              slug: "maximum-depth-of-binary-tree",              platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
    { title: "Symmetric Tree",                            slug: "symmetric-tree",                            platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/symmetric-tree/" },
    { title: "Invert Binary Tree",                        slug: "invert-binary-tree",                        platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/invert-binary-tree/" },
    { title: "Path Sum",                                  slug: "path-sum",                                  platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/path-sum/" },
    { title: "Same Tree",                                 slug: "same-tree",                                 platform: "LEETCODE", topic: "Tree", difficulty: "EASY",   url: "https://leetcode.com/problems/same-tree/" },
    { title: "Binary Tree Level Order Traversal",         slug: "binary-tree-level-order-traversal",         platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
    { title: "Validate Binary Search Tree",               slug: "validate-binary-search-tree",               platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
    { title: "Binary Tree Right Side View",               slug: "binary-tree-right-side-view",               platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/binary-tree-right-side-view/" },
    { title: "Lowest Common Ancestor of a Binary Tree",   slug: "lowest-common-ancestor-of-a-binary-tree",   platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
    { title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", platform: "LEETCODE", topic: "Tree", difficulty: "MEDIUM", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
    { title: "Binary Tree Maximum Path Sum",              slug: "binary-tree-maximum-path-sum",              platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
    { title: "Serialize and Deserialize Binary Tree",     slug: "serialize-and-deserialize-binary-tree",     platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },
    { title: "Word Search II",                            slug: "word-search-ii",                            platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/word-search-ii/" },
    { title: "Maximum Width of Binary Tree",              slug: "maximum-width-of-binary-tree",              platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-width-of-binary-tree/" },
    { title: "Binary Tree Cameras",                       slug: "binary-tree-cameras",                       platform: "LEETCODE", topic: "Tree", difficulty: "HARD",   url: "https://leetcode.com/problems/binary-tree-cameras/" },

    // ── HEAP (PRIORITY QUEUE) ────────────────────────────────────────────────
    { title: "Last Stone Weight",                         slug: "last-stone-weight",                         platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/last-stone-weight/" },
    { title: "Kth Largest Element in a Stream",           slug: "kth-largest-element-in-a-stream",           platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" },
    { title: "Relative Ranks",                            slug: "relative-ranks",                            platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/relative-ranks/" },
    { title: "K Closest Points to Origin",                slug: "k-closest-points-to-origin",                platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/k-closest-points-to-origin/" },
    { title: "Find Median from Data Stream",              slug: "find-median-from-data-stream-easy",         platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "EASY",   url: "https://leetcode.com/problems/find-median-from-data-stream/" },
    { title: "Top K Frequent Elements",                   slug: "top-k-frequent-elements-heap",              platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
    { title: "Kth Largest Element in an Array",           slug: "kth-largest-element-heap",                  platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
    { title: "Task Scheduler",                            slug: "task-scheduler",                            platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/task-scheduler/" },
    { title: "Design Twitter",                            slug: "design-twitter",                            platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/design-twitter/" },
    { title: "Reorganize String",                         slug: "reorganize-string",                         platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "MEDIUM", url: "https://leetcode.com/problems/reorganize-string/" },
    { title: "Find Median from Data Stream",              slug: "find-median-from-data-stream",              platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/find-median-from-data-stream/" },
    { title: "Merge k Sorted Lists",                      slug: "merge-k-sorted-lists-heap",                 platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
    { title: "Minimum Cost to Hire K Workers",            slug: "minimum-cost-to-hire-k-workers",            platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-cost-to-hire-k-workers/" },
    { title: "Trapping Rain Water II",                    slug: "trapping-rain-water-ii",                    platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/trapping-rain-water-ii/" },
    { title: "IPO",                                       slug: "ipo",                                       platform: "LEETCODE", topic: "Heap (Priority Queue)", difficulty: "HARD",   url: "https://leetcode.com/problems/ipo/" },

    // ── GRAPH ────────────────────────────────────────────────────────────────
    { title: "Find if Path Exists in Graph",              slug: "find-if-path-exists-in-graph",              platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/find-if-path-exists-in-graph/" },
    { title: "Find the Town Judge",                       slug: "find-the-town-judge",                       platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/find-the-town-judge/" },
    { title: "Flood Fill",                                slug: "flood-fill",                                platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/flood-fill/" },
    { title: "Number of Islands",                         slug: "number-of-islands",                         platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/number-of-islands/" },
    { title: "Max Area of Island",                        slug: "max-area-of-island",                        platform: "LEETCODE", topic: "Graph", difficulty: "EASY",   url: "https://leetcode.com/problems/max-area-of-island/" },
    { title: "Clone Graph",                               slug: "clone-graph",                               platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/clone-graph/" },
    { title: "Course Schedule",                           slug: "course-schedule",                           platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/course-schedule/" },
    { title: "Pacific Atlantic Water Flow",               slug: "pacific-atlantic-water-flow",               platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/pacific-atlantic-water-flow/" },
    { title: "Rotting Oranges",                           slug: "rotting-oranges",                           platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/rotting-oranges/" },
    { title: "Number of Connected Components in an Undirected Graph", slug: "number-of-connected-components", platform: "LEETCODE", topic: "Graph", difficulty: "MEDIUM", url: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/" },
    { title: "Word Ladder",                               slug: "word-ladder",                               platform: "LEETCODE", topic: "Graph", difficulty: "HARD",   url: "https://leetcode.com/problems/word-ladder/" },
    { title: "Alien Dictionary",                          slug: "alien-dictionary",                          platform: "LEETCODE", topic: "Graph", difficulty: "HARD",   url: "https://leetcode.com/problems/alien-dictionary/" },
    { title: "Critical Connections in a Network",         slug: "critical-connections-in-a-network",         platform: "LEETCODE", topic: "Graph", difficulty: "HARD",   url: "https://leetcode.com/problems/critical-connections-in-a-network/" },
    { title: "Minimum Cost to Reach Destination in Time", slug: "minimum-cost-to-reach-destination-in-time", platform: "LEETCODE", topic: "Graph", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/" },
    { title: "Swim in Rising Water",                      slug: "swim-in-rising-water",                      platform: "LEETCODE", topic: "Graph", difficulty: "HARD",   url: "https://leetcode.com/problems/swim-in-rising-water/" },

    // ── BACKTRACKING ─────────────────────────────────────────────────────────
    { title: "Letter Case Permutation",                   slug: "letter-case-permutation",                   platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY",   url: "https://leetcode.com/problems/letter-case-permutation/" },
    { title: "Binary Watch",                              slug: "binary-watch",                              platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY",   url: "https://leetcode.com/problems/binary-watch/" },
    { title: "Subsets",                                   slug: "subsets",                                   platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY",   url: "https://leetcode.com/problems/subsets/" },
    { title: "Combinations",                              slug: "combinations",                              platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY",   url: "https://leetcode.com/problems/combinations/" },
    { title: "Generate Parentheses",                      slug: "generate-parentheses-easy",                 platform: "LEETCODE", topic: "Backtracking", difficulty: "EASY",   url: "https://leetcode.com/problems/generate-parentheses/" },
    { title: "Permutations",                              slug: "permutations",                              platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/permutations/" },
    { title: "Combination Sum",                           slug: "combination-sum",                           platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/combination-sum/" },
    { title: "Generate Parentheses",                      slug: "generate-parentheses",                      platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/generate-parentheses/" },
    { title: "Word Search",                               slug: "word-search",                               platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/word-search/" },
    { title: "Subsets II",                                slug: "subsets-ii",                                platform: "LEETCODE", topic: "Backtracking", difficulty: "MEDIUM", url: "https://leetcode.com/problems/subsets-ii/" },
    { title: "N-Queens",                                  slug: "n-queens",                                  platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/n-queens/" },
    { title: "Sudoku Solver",                             slug: "sudoku-solver",                             platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/sudoku-solver/" },
    { title: "Word Break II",                             slug: "word-break-ii",                             platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/word-break-ii/" },
    { title: "Palindrome Partitioning II",                slug: "palindrome-partitioning-ii",                platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/palindrome-partitioning-ii/" },
    { title: "Expression Add Operators",                  slug: "expression-add-operators",                  platform: "LEETCODE", topic: "Backtracking", difficulty: "HARD",   url: "https://leetcode.com/problems/expression-add-operators/" },

    // ── DYNAMIC PROGRAMMING ──────────────────────────────────────────────────
    { title: "Climbing Stairs",                           slug: "climbing-stairs",                           platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/climbing-stairs/" },
    { title: "House Robber",                              slug: "house-robber",                              platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/house-robber/" },
    { title: "Min Cost Climbing Stairs",                  slug: "min-cost-climbing-stairs",                  platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/min-cost-climbing-stairs/" },
    { title: "Pascal's Triangle",                         slug: "pascals-triangle",                          platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/pascals-triangle/" },
    { title: "Fibonacci Number",                          slug: "fibonacci-number",                          platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "EASY",   url: "https://leetcode.com/problems/fibonacci-number/" },
    { title: "Unique Paths",                              slug: "unique-paths",                              platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/unique-paths/" },
    { title: "Coin Change",                               slug: "coin-change",                               platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/coin-change/" },
    { title: "Longest Increasing Subsequence",            slug: "longest-increasing-subsequence",            platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
    { title: "Word Break",                                slug: "word-break",                                platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/word-break/" },
    { title: "Jump Game",                                 slug: "jump-game",                                 platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "MEDIUM", url: "https://leetcode.com/problems/jump-game/" },
    { title: "Edit Distance",                             slug: "edit-distance",                             platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/edit-distance/" },
    { title: "Burst Balloons",                            slug: "burst-balloons",                            platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/burst-balloons/" },
    { title: "Longest Valid Parentheses",                 slug: "longest-valid-parentheses-dp",              platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/longest-valid-parentheses/" },
    { title: "Regular Expression Matching",               slug: "regular-expression-matching-dp",            platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/regular-expression-matching/" },
    { title: "Palindrome Partitioning IV",                slug: "palindrome-partitioning-iv",                platform: "LEETCODE", topic: "Dynamic Programming", difficulty: "HARD",   url: "https://leetcode.com/problems/palindrome-partitioning-iv/" },

    // ── GREEDY ───────────────────────────────────────────────────────────────
    { title: "Assign Cookies",                            slug: "assign-cookies",                            platform: "LEETCODE", topic: "Greedy", difficulty: "EASY",   url: "https://leetcode.com/problems/assign-cookies/" },
    { title: "Lemonade Change",                           slug: "lemonade-change",                           platform: "LEETCODE", topic: "Greedy", difficulty: "EASY",   url: "https://leetcode.com/problems/lemonade-change/" },
    { title: "Best Time to Buy and Sell Stock II",        slug: "best-time-to-buy-and-sell-stock-ii",        platform: "LEETCODE", topic: "Greedy", difficulty: "EASY",   url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/" },
    { title: "Is Subsequence",                            slug: "is-subsequence",                            platform: "LEETCODE", topic: "Greedy", difficulty: "EASY",   url: "https://leetcode.com/problems/is-subsequence/" },
    { title: "Maximum Units on a Truck",                  slug: "maximum-units-on-a-truck",                  platform: "LEETCODE", topic: "Greedy", difficulty: "EASY",   url: "https://leetcode.com/problems/maximum-units-on-a-truck/" },
    { title: "Jump Game",                                 slug: "jump-game-greedy",                          platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/jump-game/" },
    { title: "Jump Game II",                              slug: "jump-game-ii",                              platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/jump-game-ii/" },
    { title: "Gas Station",                               slug: "gas-station",                               platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/gas-station/" },
    { title: "Partition Labels",                          slug: "partition-labels",                          platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/partition-labels/" },
    { title: "Minimum Number of Arrows to Burst Balloons",slug: "minimum-number-of-arrows-to-burst-balloons",platform: "LEETCODE", topic: "Greedy", difficulty: "MEDIUM", url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/" },
    { title: "Candy",                                     slug: "candy",                                     platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/candy/" },
    { title: "Jump Game VII",                             slug: "jump-game-vii",                             platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/jump-game-vii/" },
    { title: "IPO",                                       slug: "ipo-greedy",                                platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/ipo/" },
    { title: "Minimum Cost to Cut a Stick",               slug: "minimum-cost-to-cut-a-stick",               platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/" },
    { title: "Largest Rectangle in Histogram",            slug: "largest-rectangle-greedy",                  platform: "LEETCODE", topic: "Greedy", difficulty: "HARD",   url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },

    // ── BIT MANIPULATION ─────────────────────────────────────────────────────
    { title: "Single Number",                             slug: "single-number",                             platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/single-number/" },
    { title: "Number of 1 Bits",                          slug: "number-of-1-bits",                          platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/number-of-1-bits/" },
    { title: "Reverse Bits",                              slug: "reverse-bits",                              platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/reverse-bits/" },
    { title: "Missing Number",                            slug: "missing-number",                            platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/missing-number/" },
    { title: "Power of Two",                              slug: "power-of-two-bit",                          platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "EASY",   url: "https://leetcode.com/problems/power-of-two/" },
    { title: "Sum of Two Integers",                       slug: "sum-of-two-integers",                       platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/sum-of-two-integers/" },
    { title: "Counting Bits",                             slug: "counting-bits",                             platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/counting-bits/" },
    { title: "Maximum XOR of Two Numbers in an Array",    slug: "maximum-xor-of-two-numbers-in-an-array",    platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
    { title: "Single Number II",                          slug: "single-number-ii",                          platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/single-number-ii/" },
    { title: "Bitwise AND of Numbers Range",              slug: "bitwise-and-of-numbers-range",              platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "MEDIUM", url: "https://leetcode.com/problems/bitwise-and-of-numbers-range/" },
    { title: "Maximum Product of Word Lengths",           slug: "maximum-product-of-word-lengths",           platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-product-of-word-lengths/" },
    { title: "Total Hamming Distance",                    slug: "total-hamming-distance",                    platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD",   url: "https://leetcode.com/problems/total-hamming-distance/" },
    { title: "Minimum One Bit Operations to Make Integers Zero", slug: "minimum-one-bit-operations-to-make-integers-zero", platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD", url: "https://leetcode.com/problems/minimum-one-bit-operations-to-make-integers-zero/" },
    { title: "Maximum XOR With an Element From Array",    slug: "maximum-xor-with-an-element-from-array",    platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD",   url: "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/" },
    { title: "Concatenation of Consecutive Binary Numbers", slug: "concatenation-of-consecutive-binary-numbers", platform: "LEETCODE", topic: "Bit Manipulation", difficulty: "HARD", url: "https://leetcode.com/problems/concatenation-of-consecutive-binary-numbers/" },
];

/**
 * Seeds the Problem table on startup.
 * Verifies data integrity — if the table has rows but no usable LEETCODE problems,
 * it clears the table and re-seeds to fix any corrupted/mismatched data.
 * Returns the number of problems inserted (0 if already correctly seeded).
 */
export const seedProblemsIfEmpty = async () => {
    // Check for a real usable row, not just any row count
    const sample = await prisma.problem.findFirst({
        where: { topic: "Array", platform: "LEETCODE" },
    });

    if (sample) {
        return 0; // already correctly seeded, skip
    }

    // Table is either empty OR has wrong/mismatched data — clear and re-seed
    await prisma.problem.deleteMany({});

    let created = 0;
    for (const problem of problems) {
        await prisma.problem.create({ data: problem });
        created++;
    }

    return created;
};
