import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";

/**
 * Upload image to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder path
 * @param publicId - Optional public ID for the image
 * @returns Cloudinary upload response with secure URL
 */
export const uploadImageToCloudinary = async (
  file: Buffer | string,
  folder: string = "contactx/cards",
  publicId?: string
): Promise<string> => {
  try {
    const uploadOptions: any = {
      folder,
      resource_type: "image",
      overwrite: true,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    let uploadResult: UploadApiResponse;

    // Handle base64 string or Buffer
    if (typeof file === "string") {
      // Base64 string
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      // Buffer - convert to base64
      const base64 = file.toString("base64");
      const dataUri = `data:image/jpeg;base64,${base64}`;
      uploadResult = await cloudinary.uploader.upload(dataUri, uploadOptions);
    }

    return uploadResult.secure_url;
  } catch (error: any) {
    console.error("❌ Cloudinary upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID or URL of the image
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    // Extract public_id from URL if full URL is provided
    let extractedPublicId: string = publicId;
    
    if (publicId.includes("cloudinary.com")) {
      // Extract public_id from URL
      const urlParts = publicId.split("/");
      const filename = urlParts[urlParts.length - 1];
      
      if (filename) {
        const nameWithoutExt = filename.split(".")[0];
        extractedPublicId = nameWithoutExt || publicId;
        
        // Also extract folder path
        const folderIndex = urlParts.findIndex(part => part === "upload");
        if (folderIndex !== -1 && folderIndex + 2 < urlParts.length) {
          const folderParts = urlParts.slice(folderIndex + 2, -1);
          if (folderParts.length > 0 && nameWithoutExt) {
            extractedPublicId = `${folderParts.join("/")}/${nameWithoutExt}`;
          }
        }
      }
    }

    await cloudinary.uploader.destroy(extractedPublicId);
  } catch (error: any) {
    console.error("❌ Cloudinary delete error:", error);
    // Don't throw error - deletion failure shouldn't break the flow
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  files: Array<Buffer | string>,
  folder: string = "contactx/cards"
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) =>
    uploadImageToCloudinary(file, folder, undefined)
  );
  
  return Promise.all(uploadPromises);
};

