import multer from "multer";
import fs from "fs";
import path from "path";
import ApiError from "../utils/ApiError.js";

const TEMP_DIR = path.join(process.cwd(), "uploads", "temp");

// Make sure the temp dir exists (fresh clones won't have it since it's gitignored)
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, TEMP_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only image files (jpeg, jpg, png, webp, gif) are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export default upload;