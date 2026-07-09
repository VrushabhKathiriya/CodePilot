import {
    registerUser, verifyOTP, resendOtp, loginUser, refreshAccessToken, logoutUser, getCurrentUser,
    getUserProfile, upsertUserProfile, updateUserInfo, uploadAvatar, changePassword, forgotPassword,
    resetPassword, changeEmail, verifyEmailChange, deleteAccount, upsertSocialLink, deleteSocialLink,
    addEducation, updateEducation, deleteEducation, addExperience, updateExperience, deleteExperience,
    addAchievement, updateAchievement, deleteAchievement, addProject, updateProject, deleteProject, reorderProjects
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.middleware.js";
import { Router } from "express";

const router = Router();

// AUTH
router.post("/register",       authLimiter, registerUser);
router.post("/verify-otp",     authLimiter, verifyOTP);
router.post("/resend-otp",     otpLimiter,  resendOtp);
router.post("/login",          authLimiter, loginUser);
router.post("/refresh-token",  refreshAccessToken);
router.post("/logout",         verifyJWT, logoutUser);
router.get("/me",              verifyJWT, getCurrentUser);

// PASSWORD + EMAIL CHANGE
router.post("/change-password",     verifyJWT, changePassword);
router.post("/forgot-password",     authLimiter, forgotPassword);
router.post("/reset-password",      authLimiter, resetPassword);
router.post("/change-email",        verifyJWT, changeEmail);
router.post("/verify-email-change", verifyJWT, verifyEmailChange);

// ACCOUNT
router.delete("/delete-account", verifyJWT, deleteAccount);

// PROFILE
router.patch("/avatar",verifyJWT,upload.single("avatar"),uploadAvatar);
router.get("/profile/:username", getUserProfile);
router.put("/profile", verifyJWT, upsertUserProfile);
router.patch("/info", verifyJWT, updateUserInfo);

// SOCIAL LINKS
router.put("/social", verifyJWT, upsertSocialLink);
router.delete("/social/:platform", verifyJWT, deleteSocialLink);

// EDUCATION
router.post("/education", verifyJWT, addEducation);
router.patch("/education/:id", verifyJWT, updateEducation);
router.delete("/education/:id", verifyJWT, deleteEducation);

// EXPERIENCE
router.post("/experience", verifyJWT, addExperience);
router.patch("/experience/:id", verifyJWT, updateExperience);
router.delete("/experience/:id", verifyJWT, deleteExperience);

// ACHIEVEMENT
router.post("/achievement", verifyJWT, addAchievement);
router.patch("/achievement/:id", verifyJWT, updateAchievement);
router.delete("/achievement/:id", verifyJWT, deleteAchievement);

// PROJECT
router.post("/project", verifyJWT, addProject);
router.patch("/project/reorder", verifyJWT, reorderProjects);
router.patch("/project/:id", verifyJWT, updateProject);
router.delete("/project/:id", verifyJWT, deleteProject);

export default router;