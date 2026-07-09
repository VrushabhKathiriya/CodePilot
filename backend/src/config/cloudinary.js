import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// UPLOAD TO CLOUDINARY
const uploadOnCloudinary = async (localFilePath, options = {}) => {
    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "codepilot/avatars",
            ...options,
        });

        fs.unlinkSync(localFilePath);
        return response.secure_url;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw error;
    }
};

// DELETE FROM CLOUDINARY
const deleteFromCloudinary = async (publicId, options = {}) => {
    if (!publicId) return null;

    return cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        ...options,
    });
};

export { cloudinary, uploadOnCloudinary, deleteFromCloudinary };
export default uploadOnCloudinary;