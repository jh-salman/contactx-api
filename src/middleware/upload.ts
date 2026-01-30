import multer from "multer";
import { Request } from "express";

// Configure multer to store files in memory (as Buffer)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware for card images (cover, profile, logo)
export const uploadCardImages = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "profile", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]);

// Middleware for personal info images
export const uploadPersonalInfoImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "profile_img", maxCount: 1 },
]);

