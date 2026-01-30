import { Request, Response, NextFunction } from "express";
import { uploadServices } from "./upload.services";
import { deleteImageFromCloudinary } from "../../lib/upload";

// Single image upload
const uploadSingleImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const file = req.file;
    const { folder, type, subFolder } = req.body as {
      folder?: string;
      type?: 'card' | 'personal-info';
      subFolder?: 'logo' | 'profile' | 'cover' | 'image' | 'banner' | 'profile_img';
    };

    // Check if file uploaded
    if (!file) {
      // Check if base64 provided in body
      const { base64 } = req.body as { base64?: string };
      
      if (!base64) {
        return res.status(400).json({
          success: false,
          message: "File or base64 image is required",
        });
      }

      // Upload base64 image
      const uploadParams: any = { file: base64 };
      if (folder !== undefined) uploadParams.folder = folder;
      if (type !== undefined) uploadParams.type = type;
      if (subFolder !== undefined) uploadParams.subFolder = subFolder;
      
      const url = await uploadServices.uploadImage(uploadParams);

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          url,
          type: 'base64',
        },
      });
    }

    // Upload file
    const uploadParams: any = { file: file.buffer };
    if (folder !== undefined) uploadParams.folder = folder;
    if (type !== undefined) uploadParams.type = type;
    if (subFolder !== undefined) uploadParams.subFolder = subFolder;
    
    const url = await uploadServices.uploadImage(uploadParams);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url,
        type: 'file',
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
  } catch (error: any) {
    console.error("❌ Upload image error:", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload image",
      });
    }
    next(error);
  }
};

// Multiple images upload
const uploadMultipleImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const { images } = req.body as {
      images?: Array<{
        base64: string;
        folder?: string;
        type?: 'card' | 'personal-info';
        subFolder?: string;
      }>;
    };

    const uploadPromises: Array<Promise<string>> = [];

    // Handle file uploads
    if (files && files.length > 0) {
      files.forEach((file) => {
        uploadPromises.push(
          uploadServices.uploadImage({
            file: file.buffer,
            type: 'card', // Default type
          })
        );
      });
    }

    // Handle base64 images
    if (images && Array.isArray(images)) {
      images.forEach((imageData) => {
        const uploadParams: any = { file: imageData.base64 };
        if (imageData.folder !== undefined) uploadParams.folder = imageData.folder;
        if (imageData.type !== undefined) uploadParams.type = imageData.type;
        if (imageData.subFolder !== undefined) uploadParams.subFolder = imageData.subFolder;
        
        uploadPromises.push(uploadServices.uploadImage(uploadParams));
      });
    }

    if (uploadPromises.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided",
      });
    }

    const urls = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        urls,
        count: urls.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Upload multiple images error:", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload images",
      });
    }
    next(error);
  }
};

// Delete image
const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { url } = req.body as { url: string };

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    await deleteImageFromCloudinary(url);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Delete image error:", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete image",
      });
    }
    next(error);
  }
};

export const uploadController = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
};

