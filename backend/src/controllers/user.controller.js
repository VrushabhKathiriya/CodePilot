import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.ts";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import generateOtp from "../utils/generateOtp.js";
import { sendOtpEmail } from "../services/email.service.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

// REGISTER
export const registerUser = asyncHandler(async (req, res) => {
    let { fullName, username, email, password } = req.body;

    // VALIDATION
    if (!fullName || !username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    fullName = fullName.trim();
    username = username.toLowerCase().trim();
    email    = email.toLowerCase().trim();

    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Invalid email address");
    }

    if (
        !validator.isStrongPassword(password, {
            minLength:    8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers:   1,
            minSymbols:   1,
        })
    ) {
        throw new ApiError(
            400,
            "Password must contain uppercase, lowercase, number and special character"
        );
    }

    // CHECK VERIFIED USERS
    const verifiedUsernameExists = await prisma.user.findFirst({
        where: { username, isVerified: true },
    });

    if (verifiedUsernameExists) {
        throw new ApiError(409, "Username already taken");
    }

    const verifiedEmailExists = await prisma.user.findFirst({
        where: { email, isVerified: true },
    });

    if (verifiedEmailExists) {
        throw new ApiError(409, "Email already registered");
    }

    // REMOVE OLD UNVERIFIED USERS
    await prisma.user.deleteMany({
        where: {
            isVerified: false,
            OR: [{ username }, { email }],
        },
    });

    // HASH PASSWORD
    const passwordHash = await bcrypt.hash(password, 10);

    // GENERATE OTP
    const otp       = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // CREATE USER
    const user = await prisma.user.create({
        data: {
            fullName,
            username,
            email,
            passwordHash,
            isVerified:   false,
            authProvider: "local",
        },
    });

    // STORE OTP
    await prisma.oTP.create({
        data: {
            userId:    user.id,
            email,
            otpCode:   otp,
            purpose:   "REGISTER",
            expiresAt: otpExpiry,
        },
    });

    // SEND EMAIL
    try {
        await sendOtpEmail(email, otp);
    } catch (error) {
        await prisma.user.delete({ where: { id: user.id } });
        throw new ApiError(500, "Failed to send OTP");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, null, "OTP sent successfully"));
});

// VERIFY OTP
export const verifyOTP = asyncHandler(async (req, res) => {
    let { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    email = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
        throw new ApiError(400, "Account already verified");
    }

    const otpRecord = await prisma.oTP.findFirst({
        where: {
            userId:  user.id,
            purpose: "REGISTER",
            isUsed:  false,
        },
        orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
        throw new ApiError(404, "OTP not found");
    }

    if (otpRecord.otpCode !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (otpRecord.expiresAt < new Date()) {
        throw new ApiError(400, "OTP expired");
    }

    // VERIFY USER
    await prisma.user.update({
        where: { id: user.id },
        data:  { isVerified: true },
    });

    // MARK OTP USED
    await prisma.oTP.update({
        where: { id: otpRecord.id },
        data:  { isUsed: true },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Account verified successfully"));
});

// LOGIN
export const loginUser = asyncHandler(async (req, res) => {
    let { username, email, password } = req.body;

    if ((!email && !username) || !password) {
        throw new ApiError(400, "Email or username and password are required");
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                email    ? { email:    email.toLowerCase().trim()    } : {},
                username ? { username: username.toLowerCase().trim() } : {},
            ],
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.isVerified) {
        throw new ApiError(401, "Please verify your account first");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // TOKENS
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // STORE REFRESH TOKEN
    await prisma.refreshToken.create({
        data: {
            userId:    user.id,
            tokenHash: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    // CREATE SESSION
    await prisma.session.create({
        data: {
            userId:       user.id,
            ipAddress:    req.ip,
            userAgent:    req.headers["user-agent"],
            lastActivity: new Date(),
        },
    });

    // UPDATE LAST LOGIN
    await prisma.user.update({
        where: { id: user.id },
        data:  { lastLogin: new Date() },
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                accessToken,
                refreshToken,
                user: {
                    id:       user.id,
                    fullName: user.fullName,
                    username: user.username,
                    email:    user.email,
                },
            },
            "Login successful"
        )
    );
});

// REFRESH ACCESS TOKEN
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token required");
    }

    let decoded;

    try {
        decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const storedToken = await prisma.refreshToken.findFirst({
        where: {
            userId:    user.id,
            tokenHash: incomingRefreshToken,
            revoked:   false,
        },
    });

    if (!storedToken) {
        throw new ApiError(401, "Refresh token mismatch");
    }

    if (storedToken.expiresAt < new Date()) {
        throw new ApiError(401, "Refresh token expired");
    }

    // REVOKE OLD TOKEN
    await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data:  { revoked: true, revokedAt: new Date() },
    });

    // GENERATE NEW TOKENS
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // STORE NEW REFRESH TOKEN
    await prisma.refreshToken.create({
        data: {
            userId:    user.id,
            tokenHash: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    // UPDATE SESSION ACTIVITY
    await prisma.session.updateMany({
        where: { userId: user.id },
        data:  { lastActivity: new Date() },
    });

    const cookieOptions = {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    return res
        .status(200)
        .cookie("accessToken",  accessToken,  cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed successfully"
            )
        );
});

// LOGOUT
export const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    await prisma.refreshToken.updateMany({
        where: { userId: req.user.id, revoked: false },
        data:  { revoked: true, revokedAt: new Date() },
    });

    await prisma.session.deleteMany({
        where: { userId: req.user.id },
    });

    const cookieOptions = {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    return res
        .status(200)
        .clearCookie("accessToken",  cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

// GET CURRENT USER
export const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// GET USER PROFILE
export const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id:        true,
            fullName:  true,
            username:  true,
            createdAt: true,

            profile: {
                select: {
                    avatarUrl:        true,
                    bio:              true,
                    country:          true,
                    githubUsername:   true,
                    leetcodeUsername: true,
                    codeforcesHandle: true,
                    codechefUsername: true,
                    atcoderUsername:  true,
                    gfgUsername:      true,
                    visibility:       true,
                    profileCompleted: true,
                    profileViews:     true,
                    lastRefreshedAt:  true,   
                }
            },

            educations: {
                select: {
                    id:             true,
                    instituteName:  true,
                    degree:         true,
                    branch:         true,
                    startYear:      true,
                    graduationYear: true,
                },
                orderBy: { graduationYear: "desc" }
            },

            experiences: {
                select: {
                    id:          true,
                    company:     true,
                    jobTitle:    true,
                    description: true,
                    startMonth:  true,
                    startYear:   true,
                    endMonth:    true,
                    endYear:     true,
                    isCurrent:   true,
                },
                orderBy: { startYear: "desc" }
            },

            achievements: {
                select: {
                    id:             true,
                    title:          true,
                    description:    true,
                    certificateUrl: true,
                    issuer:         true,
                    issueMonth:     true,
                    issueYear:      true,
                },
                orderBy: { issueYear: "desc" }
            },

            projects: {                        
                select: {
                    id:           true,
                    title:        true,
                    description:  true,
                    techStack:    true,
                    githubUrl:    true,
                    liveUrl:      true,
                    thumbnailUrl: true,
                    displayOrder: true,
                },
                orderBy: { displayOrder: "asc" }
            },

            socialLinks: {
                select: {
                    platform: true,
                    url:      true,
                }
            },

            codingPlatformStats: {
                select: {
                    platform:         true,
                    handle:           true,
                    rating:           true,
                    maxRating:        true,
                    rank:             true,
                    totalSolved:      true,
                    easySolved:       true,
                    mediumSolved:     true,
                    hardSolved:       true,
                    contestsCount:    true,
                    currentStreak:    true,    
                    maxStreak:        true,    
                    totalActiveDays:  true,    
                    totalSubmissions: true,    
                    lastSyncedAt:     true,
                }
            },

            contestHistory: {                  
                select: {
                    platform:     true,
                    contestName:  true,
                    contestDate:  true,
                    rank:         true,
                    rating:       true,
                    ratingChange: true,
                },
                orderBy: { contestDate: "asc" }
            },

            topicStats: {                      
                select: {
                    platform:     true,
                    topic:        true,
                    problemCount: true,
                },
                orderBy: { problemCount: "desc" }
            },

            platformBadges: {                  
                select: {
                    platform:     true,
                    badgeName:    true,
                    badgeIconUrl: true,
                    earnedAt:     true,
                }
            },

            githubStats: {                     
                select: {
                    handle:             true,
                    totalContributions: true,
                    totalActiveDays:    true,
                    totalCommits:       true,
                    totalStars:         true,
                    totalPRs:           true,
                    totalIssues:        true,
                    currentStreak:      true,
                    maxStreak:          true,
                    totalRepos:         true,
                    followers:          true,
                    following:          true,
                    lastSyncedAt:       true,
                }
            },

            githubLanguages: {                 
                select: {
                    language:   true,
                    percentage: true,
                    color:      true,
                },
                orderBy: { percentage: "desc" }
            },
        }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // BLOCK PRIVATE PROFILES UNLESS THE VIWER IS THE OWNER THEMSELVES
    if (
        user.profile?.visibility === "PRIVATE" &&
        req.user?.id !== user.id
    ) {
        throw new ApiError(403, "This profile is private");
    }

    
    if (req.user?.id !== user.id) {
        await prisma.userProfile.upsert({
            where:  { userId: user.id },
            create: { userId: user.id, profileViews: 1 },
            update: { profileViews: { increment: 1 } },
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

// UPSERT USER PROFILE
export const upsertUserProfile = asyncHandler(async (req, res) => {
    const {
        bio,
        country,
        githubUsername,
        leetcodeUsername,
        codeforcesHandle,
        codechefUsername,
        atcoderUsername,
        gfgUsername,
        visibility,
    } = req.body;
 
    
    const data = {};
 
    if (bio              !== undefined) data.bio              = bio;
    if (country          !== undefined) data.country          = country;
    if (githubUsername   !== undefined) data.githubUsername   = githubUsername;
    if (leetcodeUsername !== undefined) data.leetcodeUsername = leetcodeUsername;
    if (codeforcesHandle !== undefined) data.codeforcesHandle = codeforcesHandle;
    if (codechefUsername !== undefined) data.codechefUsername = codechefUsername;
    if (atcoderUsername  !== undefined) data.atcoderUsername  = atcoderUsername;
    if (gfgUsername      !== undefined) data.gfgUsername      = gfgUsername;
    if (visibility       !== undefined) data.visibility       = visibility;
 
    const existing = await prisma.userProfile.findUnique({
        where: { userId: req.user.id }
    });
 
    const merged = { ...existing, ...data };
 
    data.profileCompleted = !!(
        merged.avatarUrl &&
        merged.bio       &&
        merged.country
    );
 
    const profile = await prisma.userProfile.upsert({
        where:  { userId: req.user.id },
        create: { userId: req.user.id, ...data },
        update: data,
    });
 
    return res
        .status(200)
        .json(new ApiResponse(200, profile, "Profile updated successfully"));
});
 
// UPDATE BASIC USER INFO  (fullName, username) 
export const updateUserInfo = asyncHandler(async (req, res) => {
    const { fullName, username } = req.body;
 
    if (!fullName && !username) {
        throw new ApiError(400, "Provide at least one field to update");
    }
 
    const data = {};
 
    if (fullName) data.fullName = fullName.trim();
 
    if (username) {
        const taken = await prisma.user.findFirst({
            where: {
                username: username.toLowerCase().trim(),
                NOT: { id: req.user.id } 
            }
        });
 
        if (taken) {
            throw new ApiError(409, "Username already taken");
        }
 
        data.username = username.toLowerCase().trim();
    }
 
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data,
        select: {
            id:       true,
            fullName: true,
            username: true,
            email:    true,
        }
    });
 
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User info updated successfully"));
});
 
// UPLOAD AVATAR
export const uploadAvatar = asyncHandler(async (req, res) => {
 
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }
 
    const avatarUrl = await uploadToCloudinary(req.file.path);
 
    const profile = await prisma.userProfile.upsert({
        where:  { userId: req.user.id },
        create: { userId: req.user.id, avatarUrl },
        update: { avatarUrl },
    });
 
    return res
        .status(200)
        .json(new ApiResponse(200, { avatarUrl: profile.avatarUrl }, "Avatar uploaded successfully"));
});
 
// CHANGE PASSWORD
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
 
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }
 
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { passwordHash: true, authProvider: true }
    });
 
    if (user.authProvider !== "local" || !user.passwordHash) {
        throw new ApiError(400, "Password change is not available for Google accounts");
    }
 
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
 
    if (!isMatch) {
        throw new ApiError(401, "Current password is incorrect");
    }
 
    if (currentPassword === newPassword) {
        throw new ApiError(400, "New password must be different from current password");
    }
 
    const passwordHash = await bcrypt.hash(newPassword, 10);
 
    await prisma.user.update({
        where: { id: req.user.id },
        data:  { passwordHash },
    });
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"));
});
 
// FORGOT PASSWORD — send OTP 
export const forgotPassword = asyncHandler(async (req, res) => {
    let { email } = req.body;
 
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
 
    email = email.toLowerCase().trim();
 
    const user = await prisma.user.findUnique({ where: { email } });
 
    if (!user || user.authProvider !== "local") {
        return res
            .status(200)
            .json(new ApiResponse(200, null, "If this email exists, an OTP has been sent"));
    }
 
    const otp       = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
 
    await prisma.oTP.deleteMany({
        where: {
            userId:  user.id,
            purpose: "PASSWORD_RESET",
            isUsed:  false,
        }
    });
 
    await prisma.oTP.create({
        data: {
            userId:    user.id,
            email,
            otpCode:   otp,
            purpose:   "PASSWORD_RESET",
            expiresAt: otpExpiry,
        }
    });
 
    await sendOtpEmail(email, otp);
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "If this email exists, an OTP has been sent"));
});
 
// RESET PASSWORD — verify OTP + set new password
export const resetPassword = asyncHandler(async (req, res) => {
    let { email, otp, newPassword } = req.body;
 
    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP and new password are required");
    }
 
    email = email.toLowerCase().trim();
 
    const user = await prisma.user.findUnique({ where: { email } });
 
    if (!user) {
        throw new ApiError(404, "User not found");
    }
 
    const otpRecord = await prisma.oTP.findFirst({
        where: {
            userId:  user.id,
            purpose: "PASSWORD_RESET",
            isUsed:  false,
        },
        orderBy: { createdAt: "desc" }
    });
 
    if (!otpRecord) {
        throw new ApiError(404, "OTP not found");
    }
 
    if (otpRecord.otpCode !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }
 
    if (otpRecord.expiresAt < new Date()) {
        throw new ApiError(400, "OTP expired");
    }
 
    const passwordHash = await bcrypt.hash(newPassword, 10);
 
    await prisma.user.update({
        where: { id: user.id },
        data:  { passwordHash },
    });
 
    await prisma.oTP.update({
        where: { id: otpRecord.id },
        data:  { isUsed: true },
    });
 
    await prisma.refreshToken.updateMany({
        where: { userId: user.id, revoked: false },
        data:  { revoked: true, revokedAt: new Date() },
    });
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password reset successfully"));
});
 
// CHANGE EMAIL — send OTP to new email
export const changeEmail = asyncHandler(async (req, res) => {
    let { newEmail } = req.body;
 
    if (!newEmail) {
        throw new ApiError(400, "New email is required");
    }
 
    newEmail = newEmail.toLowerCase().trim();
 
    if (newEmail === req.user.email) {
        throw new ApiError(400, "New email must be different from current email");
    }
 
    const emailTaken = await prisma.user.findFirst({
        where: { email: newEmail, isVerified: true }
    });
 
    if (emailTaken) {
        throw new ApiError(409, "Email already in use");
    }
 
    const otp       = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
 
    await prisma.oTP.deleteMany({
        where: {
            userId:  req.user.id,
            purpose: "EMAIL_CHANGE",
            isUsed:  false,
        }
    });
 
    await prisma.oTP.create({
        data: {
            userId:    req.user.id,
            email:     newEmail,
            otpCode:   otp,
            purpose:   "EMAIL_CHANGE",
            expiresAt: otpExpiry,
        }
    });
 
    await sendOtpEmail(newEmail, otp);
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "OTP sent to new email"));
});
 
// VERIFY EMAIL CHANGE — confirm OTP + swap email
export const verifyEmailChange = asyncHandler(async (req, res) => {
    const { otp } = req.body;
 
    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }
 
    const otpRecord = await prisma.oTP.findFirst({
        where: {
            userId:  req.user.id,
            purpose: "EMAIL_CHANGE",
            isUsed:  false,
        },
        orderBy: { createdAt: "desc" }
    });
 
    if (!otpRecord) {
        throw new ApiError(404, "OTP not found. Please request email change again");
    }
 
    if (otpRecord.otpCode !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }
 
    if (otpRecord.expiresAt < new Date()) {
        throw new ApiError(400, "OTP expired");
    }
 
    await prisma.user.update({
        where: { id: req.user.id },
        data:  { email: otpRecord.email },
    });
 
    await prisma.oTP.update({
        where: { id: otpRecord.id },
        data:  { isUsed: true },
    });
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Email updated successfully"));
});
 
// DELETE ACCOUNT
export const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
 
    const user = await prisma.user.findUnique({
        where:  { id: req.user.id },
        select: { passwordHash: true, authProvider: true }
    });
 
    if (user.authProvider === "local") {
        if (!password) {
            throw new ApiError(400, "Password is required to delete account");
        }
 
        const isMatch = await bcrypt.compare(password, user.passwordHash);
 
        if (!isMatch) {
            throw new ApiError(401, "Incorrect password");
        }
    }
    await prisma.user.delete({
        where: { id: req.user.id }
    });
 
    const cookieOptions = {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "strict",
    };
 
    return res
        .status(200)
        .clearCookie("accessToken",  cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "Account deleted successfully"));
});
 
// SOCIAL LINKS — UPSERT
export const upsertSocialLink = asyncHandler(async (req, res) => {
    const { platform, url } = req.body;
 
    if (!platform || !url) {
        throw new ApiError(400, "Platform and URL are required");
    }
 
    const link = await prisma.socialLink.upsert({
        where: {
            userId_platform: {
                userId:   req.user.id,
                platform: platform.toLowerCase().trim(),
            }
        },
        create: {
            userId:   req.user.id,
            platform: platform.toLowerCase().trim(),
            url:      url.trim(),
        },
        update: {
            url: url.trim(),
        }
    });
 
    return res
        .status(200)
        .json(new ApiResponse(200, link, "Social link saved successfully"));
});
 
// SOCIAL LINKS — DELETE
export const deleteSocialLink = asyncHandler(async (req, res) => {
    const { platform } = req.params;
 
    const link = await prisma.socialLink.findUnique({
        where: {
            userId_platform: {
                userId:   req.user.id,
                platform: platform.toLowerCase().trim(),
            }
        }
    });
 
    if (!link) {
        throw new ApiError(404, "Social link not found");
    }
 
    await prisma.socialLink.delete({
        where: {
            userId_platform: {
                userId:   req.user.id,
                platform: platform.toLowerCase().trim(),
            }
        }
    });
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Social link removed successfully"));
});
 
// EDUCATION — ADD
export const addEducation = asyncHandler(async (req, res) => {
    const { instituteName, degree, branch, startYear, graduationYear } = req.body;
 
    if (!instituteName || !degree) {
        throw new ApiError(400, "Institute name and degree are required");
    }
 
    const education = await prisma.education.create({
        data: {
            userId:         req.user.id,
            instituteName:  instituteName.trim(),
            degree:         degree.trim(),
            branch:         branch?.trim()     || null,
            startYear:      startYear          || null,
            graduationYear: graduationYear     || null,
        }
    });
 
    return res
        .status(201)
        .json(new ApiResponse(201, education, "Education added successfully"));
});
 
// EDUCATION — UPDATE
export const updateEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { instituteName, degree, branch, startYear, graduationYear } = req.body;
 
    const education = await prisma.education.findUnique({ where: { id } });
 
    if (!education) {
        throw new ApiError(404, "Education record not found");
    }
 
    if (education.userId !== req.user.id) {
        throw new ApiError(403, "Forbidden");
    }
 
    const data = {};
 
    if (instituteName  !== undefined) data.instituteName  = instituteName.trim();
    if (degree         !== undefined) data.degree         = degree.trim();
    if (branch         !== undefined) data.branch         = branch?.trim() || null;
    if (startYear      !== undefined) data.startYear      = startYear;
    if (graduationYear !== undefined) data.graduationYear = graduationYear;
 
    const updated = await prisma.education.update({ where: { id }, data });
 
    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Education updated successfully"));
});
 
// EDUCATION — DELETE
export const deleteEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;
 
    const education = await prisma.education.findUnique({ where: { id } });
 
    if (!education) {
        throw new ApiError(404, "Education record not found");
    }
 
    if (education.userId !== req.user.id) {
        throw new ApiError(403, "Forbidden");
    }
 
    await prisma.education.delete({ where: { id } });
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Education deleted successfully"));
});
 
// EXPERIENCE — ADD
export const addExperience = asyncHandler(async (req, res) => {
    const {
        company, jobTitle, description,
        startMonth, startYear, endMonth, endYear, isCurrent
    } = req.body;
 
    if (!company || !jobTitle) {
        throw new ApiError(400, "Company and job title are required");
    }
 
    const experience = await prisma.experience.create({
        data: {
            userId:      req.user.id,
            company:     company.trim(),
            jobTitle:    jobTitle.trim(),
            description: description?.trim() || null,
            startMonth:  startMonth          || null,
            startYear:   startYear           || null,
            endMonth:    isCurrent ? null : (endMonth || null),
            endYear:     isCurrent ? null : (endYear  || null),
            isCurrent:   isCurrent           || false,
        }
    });
 
    return res
        .status(201)
        .json(new ApiResponse(201, experience, "Experience added successfully"));
});
 
// EXPERIENCE — UPDATE
export const updateExperience = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        company, jobTitle, description,
        startMonth, startYear, endMonth, endYear, isCurrent
    } = req.body;
 
    const experience = await prisma.experience.findUnique({ where: { id } });
 
    if (!experience) {
        throw new ApiError(404, "Experience record not found");
    }
 
    if (experience.userId !== req.user.id) {
        throw new ApiError(403, "Forbidden");
    }
 
    const data = {};
 
    if (company     !== undefined) data.company     = company.trim();
    if (jobTitle    !== undefined) data.jobTitle    = jobTitle.trim();
    if (description !== undefined) data.description = description?.trim() || null;
    if (startMonth  !== undefined) data.startMonth  = startMonth;
    if (startYear   !== undefined) data.startYear   = startYear;
    if (isCurrent   !== undefined) data.isCurrent   = isCurrent;
 
    if (isCurrent) {
        data.endMonth = null;
        data.endYear  = null;
    } else {
        if (endMonth !== undefined) data.endMonth = endMonth;
        if (endYear  !== undefined) data.endYear  = endYear;
    }
 
    const updated = await prisma.experience.update({ where: { id }, data });
 
    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Experience updated successfully"));
});
 
// EXPERIENCE — DELETE
export const deleteExperience = asyncHandler(async (req, res) => {
    const { id } = req.params;
 
    const experience = await prisma.experience.findUnique({ where: { id } });
 
    if (!experience) {
        throw new ApiError(404, "Experience record not found");
    }
 
    if (experience.userId !== req.user.id) {
        throw new ApiError(403, "Forbidden");
    }
 
    await prisma.experience.delete({ where: { id } });
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Experience deleted successfully"));
});
 
// ACHIEVEMENT — ADD
export const addAchievement = asyncHandler(async (req, res) => {
    const { title, description, certificateUrl, issuer, issueMonth, issueYear } = req.body;
 
    if (!title) {
        throw new ApiError(400, "Title is required");
    }
 
    const achievement = await prisma.achievement.create({
        data: {
            userId:         req.user.id,
            title:          title.trim(),
            description:    description?.trim()    || null,
            certificateUrl: certificateUrl?.trim() || null,
            issuer:         issuer?.trim()         || null,
            issueMonth:     issueMonth             || null,
            issueYear:      issueYear              || null,
        }
    });
 
    return res
        .status(201)
        .json(new ApiResponse(201, achievement, "Achievement added successfully"));
});
 
// ACHIEVEMENT — UPDATE
export const updateAchievement = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, certificateUrl, issuer, issueMonth, issueYear } = req.body;
 
    const achievement = await prisma.achievement.findUnique({ where: { id } });
 
    if (!achievement) {
        throw new ApiError(404, "Achievement not found");
    }
 
    if (achievement.userId !== req.user.id) {
        throw new ApiError(403, "Forbidden");
    }
 
    const data = {};
 
    if (title          !== undefined) data.title          = title.trim();
    if (description    !== undefined) data.description    = description?.trim()    || null;
    if (certificateUrl !== undefined) data.certificateUrl = certificateUrl?.trim() || null;
    if (issuer         !== undefined) data.issuer         = issuer?.trim()         || null;
    if (issueMonth     !== undefined) data.issueMonth     = issueMonth;
    if (issueYear      !== undefined) data.issueYear      = issueYear;
 
    const updated = await prisma.achievement.update({ where: { id }, data });
 
    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Achievement updated successfully"));
});
 
// ACHIEVEMENT — DELETE
export const deleteAchievement = asyncHandler(async (req, res) => {
    const { id } = req.params;
 
    const achievement = await prisma.achievement.findUnique({ where: { id } });
 
    if (!achievement) {
        throw new ApiError(404, "Achievement not found");
    }
 
    if (achievement.userId !== req.user.id) {
        throw new ApiError(403, "Forbidden");
    }
 
    await prisma.achievement.delete({ where: { id } });
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Achievement deleted successfully"));
});
