import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file from local disk (where multer saved it) to Cloudinary,
 * then removes the local temp file regardless of outcome.
 *
 * @param {string} localFilePath - path to the file multer wrote to disk
 * @param {object} [options] - extra options merged into the Cloudinary upload call
 * @returns {Promise<string|null>} the secure_url of the uploaded asset, or null if no path given
 */
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
        // Clean up the temp file even if the upload failed, so it doesn't pile up
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw error;
    }
};

/**
 * Deletes an asset from Cloudinary given its public_id.
 * Useful when replacing an avatar — remove the old image before/after setting the new one.
 *
 * @param {string} publicId
 * @param {object} [options]
 */
const deleteFromCloudinary = async (publicId, options = {}) => {
    if (!publicId) return null;

    return cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        ...options,
    });
};

export { cloudinary, uploadOnCloudinary, deleteFromCloudinary };
export default uploadOnCloudinary;