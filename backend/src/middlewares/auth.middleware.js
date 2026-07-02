import jwt from "jsonwebtoken";
import prisma from "../config/prisma.ts";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, _, next) => {

    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
            id:           true,
            fullName:     true,
            username:     true,
            email:        true,
            authProvider: true,
            isVerified:   true,
            isActive:     true,
            lastLogin:    true,
            createdAt:    true,
            updatedAt:    true,

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
                }
            }
        }
    });

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Account is deactivated");
    }

    req.user = user;

    next();
});

export default verifyJWT;