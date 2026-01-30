import { Router } from "express";
import { uploadController } from "./upload.controller";
import { upload } from "../../middleware/upload";

const router = Router();

// Single image upload (file or base64)
router.post(
  "/single",
  upload.single("image"), // Optional file upload
  uploadController.uploadSingleImage
);

// Multiple images upload
router.post(
  "/multiple",
  upload.array("images", 10), // Max 10 images
  uploadController.uploadMultipleImages
);

// Delete image
router.delete("/delete", uploadController.deleteImage);

export const uploadRoutes = router;

