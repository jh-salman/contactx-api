import { Request, Response } from "express";
import { cardServices } from "./card.services";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../../lib/upload";

// Helper function to handle file uploads
const handleFileUpload = async (
  file: Express.Multer.File | undefined,
  folder: string
): Promise<string | null> => {
  if (!file) return null;
  
  try {
    const url = await uploadImageToCloudinary(file.buffer, folder);
    return url;
  } catch (error: any) {
    console.error(`❌ Failed to upload ${folder}:`, error);
    throw new Error(`Failed to upload ${folder}: ${error.message}`);
  }
};

const createCard = async (
  req: Request,
  res: Response,
  next: any
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const userId = req.user.id;
    
    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    let logo: string | null = null;
    let profile: string | null = null;
    let cover: string | null = null;
    
    // Upload card images from files
    if (files) {
      logo = await handleFileUpload(files["logo"]?.[0], "contactx/cards/logos");
      profile = await handleFileUpload(files["profile"]?.[0], "contactx/cards/profiles");
      cover = await handleFileUpload(files["cover"]?.[0], "contactx/cards/covers");
    }
    
    // If images provided in body (base64 or URL), use those instead
    const {
      cardTitle,
      cardColor,
      logo: logoUrl, // Can be URL or base64
      profile: profileUrl,
      cover: coverUrl,
      imagesAndLayouts,
      isFavorite,
      personalInfo,
      socialLinks,
    } = req.body;

    // Handle base64 images from body if files not uploaded
    let finalLogo = logo;
    let finalProfile = profile;
    let finalCover = cover;
    
    if (!finalLogo && logoUrl) {
      if (logoUrl.startsWith("data:image") || (logoUrl.startsWith("http") && !logoUrl.includes("cloudinary.com"))) {
        finalLogo = await uploadImageToCloudinary(logoUrl, "contactx/cards/logos");
      } else {
        finalLogo = logoUrl; // Already a Cloudinary URL
      }
    }
    
    if (!finalProfile && profileUrl) {
      if (profileUrl.startsWith("data:image") || (profileUrl.startsWith("http") && !profileUrl.includes("cloudinary.com"))) {
        finalProfile = await uploadImageToCloudinary(profileUrl, "contactx/cards/profiles");
      } else {
        finalProfile = profileUrl;
      }
    }
    
    if (!finalCover && coverUrl) {
      if (coverUrl.startsWith("data:image") || (coverUrl.startsWith("http") && !coverUrl.includes("cloudinary.com"))) {
        finalCover = await uploadImageToCloudinary(coverUrl, "contactx/cards/covers");
      } else {
        finalCover = coverUrl;
      }
    }

    // Handle personal info images if provided
    let personalInfoWithImages = personalInfo;
    if (personalInfo && files) {
      const personalFiles = files;
      personalInfoWithImages = { ...personalInfo };
      
      if (personalFiles["image"]?.[0]) {
        personalInfoWithImages.image = await handleFileUpload(
          personalFiles["image"][0],
          "contactx/personal-info/images"
        );
      }
      
      if (personalFiles["logo"]?.[0]) {
        personalInfoWithImages.logo = await handleFileUpload(
          personalFiles["logo"][0],
          "contactx/personal-info/logos"
        );
      }
      
      if (personalFiles["banner"]?.[0]) {
        personalInfoWithImages.banner = await handleFileUpload(
          personalFiles["banner"][0],
          "contactx/personal-info/banners"
        );
      }
      
      if (personalFiles["profile_img"]?.[0]) {
        personalInfoWithImages.profile_img = await handleFileUpload(
          personalFiles["profile_img"][0],
          "contactx/personal-info/profiles"
        );
      }
    }
    
    // Handle personal info images from body (base64)
    if (personalInfoWithImages) {
      if (personalInfoWithImages.image && personalInfoWithImages.image.startsWith("data:image")) {
        personalInfoWithImages.image = await uploadImageToCloudinary(
          personalInfoWithImages.image,
          "contactx/personal-info/images"
        );
      }
      if (personalInfoWithImages.logo && personalInfoWithImages.logo.startsWith("data:image")) {
        personalInfoWithImages.logo = await uploadImageToCloudinary(
          personalInfoWithImages.logo,
          "contactx/personal-info/logos"
        );
      }
      if (personalInfoWithImages.banner && personalInfoWithImages.banner.startsWith("data:image")) {
        personalInfoWithImages.banner = await uploadImageToCloudinary(
          personalInfoWithImages.banner,
          "contactx/personal-info/banners"
        );
      }
      if (personalInfoWithImages.profile_img && personalInfoWithImages.profile_img.startsWith("data:image")) {
        personalInfoWithImages.profile_img = await uploadImageToCloudinary(
          personalInfoWithImages.profile_img,
          "contactx/personal-info/profiles"
        );
      }
    }

    // Extract links array from socialLinks object if it exists
    const socialLinksArray = socialLinks?.links || (Array.isArray(socialLinks) ? socialLinks : undefined);

    const result = await cardServices.createCard(
      userId,
      cardTitle,
      cardColor,
      finalLogo || undefined,
      finalProfile || undefined,
      finalCover || undefined,
      imagesAndLayouts,
      isFavorite,
      personalInfoWithImages,
      socialLinksArray,
    );

    res.status(201).json({
      success: true,
      message: "Card created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Create card error:", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
    next(error);
  }
};

const getAllCard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    console.log('🔍 getAllCard called - userId:', userId, 'user:', req.user);
    
    if (!userId) {
      console.warn('⚠️ No userId found in request');
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const result = await cardServices.getAllCard(userId);
    console.log('✅ getAllCard result:', result.length, 'cards');
    
    res.status(200).json({
      success: true,
      message: "Card details",
      data: result
    });
  } catch (error: any) {
    // Services already return empty arrays, but handle any unexpected errors
    console.error('❌ Error in getAllCard controller:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(200).json({ success: true, data: [] });
  }
};

const updateCard = async (req: Request, res: Response, next: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    // Get existing card to check current image URLs (for deletion)
    let cardToUpdate;
    try {
      cardToUpdate = await cardServices.getCardById(id, req.user.id);
    } catch (error) {
      // Card not found, will be handled by service layer
    }
    
    let logo: string | null | undefined = undefined;
    let profile: string | null | undefined = undefined;
    let cover: string | null | undefined = undefined;
    
    // Handle file uploads for card images
    if (files) {
      if (files["logo"]?.[0]) {
        // Delete old logo if exists
        if (cardToUpdate?.logo) {
          await deleteImageFromCloudinary(cardToUpdate.logo);
        }
        logo = await handleFileUpload(files["logo"][0], "contactx/cards/logos");
      }
      
      if (files["profile"]?.[0]) {
        if (cardToUpdate?.profile) {
          await deleteImageFromCloudinary(cardToUpdate.profile);
        }
        profile = await handleFileUpload(files["profile"][0], "contactx/cards/profiles");
      }
      
      if (files["cover"]?.[0]) {
        if (cardToUpdate?.cover) {
          await deleteImageFromCloudinary(cardToUpdate.cover);
        }
        cover = await handleFileUpload(files["cover"][0], "contactx/cards/covers");
      }
    }
    
    // Handle images from body (base64 or URL)
    const payload = { ...req.body };
    
    // Process logo
    if (!logo && payload.logo !== undefined) {
      if (payload.logo === null || payload.logo === "") {
        // Delete existing logo
        if (cardToUpdate?.logo) {
          await deleteImageFromCloudinary(cardToUpdate.logo);
        }
        logo = null;
      } else if (payload.logo.startsWith("data:image")) {
        if (cardToUpdate?.logo) {
          await deleteImageFromCloudinary(cardToUpdate.logo);
        }
        logo = await uploadImageToCloudinary(payload.logo, "contactx/cards/logos");
      } else if (payload.logo.startsWith("http") && !payload.logo.includes("cloudinary.com")) {
        // External URL - upload to Cloudinary
        if (cardToUpdate?.logo) {
          await deleteImageFromCloudinary(cardToUpdate.logo);
        }
        logo = await uploadImageToCloudinary(payload.logo, "contactx/cards/logos");
      } else {
        logo = payload.logo; // Already a Cloudinary URL
      }
    }
    
    // Process profile
    if (!profile && payload.profile !== undefined) {
      if (payload.profile === null || payload.profile === "") {
        if (cardToUpdate?.profile) {
          await deleteImageFromCloudinary(cardToUpdate.profile);
        }
        profile = null;
      } else if (payload.profile.startsWith("data:image")) {
        if (cardToUpdate?.profile) {
          await deleteImageFromCloudinary(cardToUpdate.profile);
        }
        profile = await uploadImageToCloudinary(payload.profile, "contactx/cards/profiles");
      } else if (payload.profile.startsWith("http") && !payload.profile.includes("cloudinary.com")) {
        if (cardToUpdate?.profile) {
          await deleteImageFromCloudinary(cardToUpdate.profile);
        }
        profile = await uploadImageToCloudinary(payload.profile, "contactx/cards/profiles");
      } else {
        profile = payload.profile;
      }
    }
    
    // Process cover
    if (!cover && payload.cover !== undefined) {
      if (payload.cover === null || payload.cover === "") {
        if (cardToUpdate?.cover) {
          await deleteImageFromCloudinary(cardToUpdate.cover);
        }
        cover = null;
      } else if (payload.cover.startsWith("data:image")) {
        if (cardToUpdate?.cover) {
          await deleteImageFromCloudinary(cardToUpdate.cover);
        }
        cover = await uploadImageToCloudinary(payload.cover, "contactx/cards/covers");
      } else if (payload.cover.startsWith("http") && !payload.cover.includes("cloudinary.com")) {
        if (cardToUpdate?.cover) {
          await deleteImageFromCloudinary(cardToUpdate.cover);
        }
        cover = await uploadImageToCloudinary(payload.cover, "contactx/cards/covers");
      } else {
        cover = payload.cover;
      }
    }
    
    // Update payload with uploaded URLs
    if (logo !== undefined) payload.logo = logo;
    if (profile !== undefined) payload.profile = profile;
    if (cover !== undefined) payload.cover = cover;
    
    // Handle personal info images
    if (payload.personalInfo && files) {
      const personalFiles = files;
      const existingPersonalInfo = cardToUpdate?.personalInfo;
      
      if (personalFiles["image"]?.[0]) {
        if (existingPersonalInfo?.image) {
          await deleteImageFromCloudinary(existingPersonalInfo.image);
        }
        payload.personalInfo.image = await handleFileUpload(
          personalFiles["image"][0],
          "contactx/personal-info/images"
        );
      }
      
      if (personalFiles["logo"]?.[0]) {
        if (existingPersonalInfo?.logo) {
          await deleteImageFromCloudinary(existingPersonalInfo.logo);
        }
        payload.personalInfo.logo = await handleFileUpload(
          personalFiles["logo"][0],
          "contactx/personal-info/logos"
        );
      }
      
      if (personalFiles["banner"]?.[0]) {
        if (existingPersonalInfo?.banner) {
          await deleteImageFromCloudinary(existingPersonalInfo.banner);
        }
        payload.personalInfo.banner = await handleFileUpload(
          personalFiles["banner"][0],
          "contactx/personal-info/banners"
        );
      }
      
      if (personalFiles["profile_img"]?.[0]) {
        if (existingPersonalInfo?.profile_img) {
          await deleteImageFromCloudinary(existingPersonalInfo.profile_img);
        }
        payload.personalInfo.profile_img = await handleFileUpload(
          personalFiles["profile_img"][0],
          "contactx/personal-info/profiles"
        );
      }
    }
    
    // Handle personal info images from body (base64)
    if (payload.personalInfo) {
      const existingPersonalInfo = cardToUpdate?.personalInfo;
      
      if (payload.personalInfo.image) {
        if (payload.personalInfo.image.startsWith("data:image")) {
          if (existingPersonalInfo?.image) {
            await deleteImageFromCloudinary(existingPersonalInfo.image);
          }
          payload.personalInfo.image = await uploadImageToCloudinary(
            payload.personalInfo.image,
            "contactx/personal-info/images"
          );
        } else if (payload.personalInfo.image.startsWith("http") && !payload.personalInfo.image.includes("cloudinary.com")) {
          if (existingPersonalInfo?.image) {
            await deleteImageFromCloudinary(existingPersonalInfo.image);
          }
          payload.personalInfo.image = await uploadImageToCloudinary(
            payload.personalInfo.image,
            "contactx/personal-info/images"
          );
        }
      }
      
      if (payload.personalInfo.logo) {
        if (payload.personalInfo.logo.startsWith("data:image")) {
          if (existingPersonalInfo?.logo) {
            await deleteImageFromCloudinary(existingPersonalInfo.logo);
          }
          payload.personalInfo.logo = await uploadImageToCloudinary(
            payload.personalInfo.logo,
            "contactx/personal-info/logos"
          );
        } else if (payload.personalInfo.logo.startsWith("http") && !payload.personalInfo.logo.includes("cloudinary.com")) {
          if (existingPersonalInfo?.logo) {
            await deleteImageFromCloudinary(existingPersonalInfo.logo);
          }
          payload.personalInfo.logo = await uploadImageToCloudinary(
            payload.personalInfo.logo,
            "contactx/personal-info/logos"
          );
        }
      }
      
      if (payload.personalInfo.banner) {
        if (payload.personalInfo.banner.startsWith("data:image")) {
          if (existingPersonalInfo?.banner) {
            await deleteImageFromCloudinary(existingPersonalInfo.banner);
          }
          payload.personalInfo.banner = await uploadImageToCloudinary(
            payload.personalInfo.banner,
            "contactx/personal-info/banners"
          );
        } else if (payload.personalInfo.banner.startsWith("http") && !payload.personalInfo.banner.includes("cloudinary.com")) {
          if (existingPersonalInfo?.banner) {
            await deleteImageFromCloudinary(existingPersonalInfo.banner);
          }
          payload.personalInfo.banner = await uploadImageToCloudinary(
            payload.personalInfo.banner,
            "contactx/personal-info/banners"
          );
        }
      }
      
      if (payload.personalInfo.profile_img) {
        if (payload.personalInfo.profile_img.startsWith("data:image")) {
          if (existingPersonalInfo?.profile_img) {
            await deleteImageFromCloudinary(existingPersonalInfo.profile_img);
          }
          payload.personalInfo.profile_img = await uploadImageToCloudinary(
            payload.personalInfo.profile_img,
            "contactx/personal-info/profiles"
          );
        } else if (payload.personalInfo.profile_img.startsWith("http") && !payload.personalInfo.profile_img.includes("cloudinary.com")) {
          if (existingPersonalInfo?.profile_img) {
            await deleteImageFromCloudinary(existingPersonalInfo.profile_img);
          }
          payload.personalInfo.profile_img = await uploadImageToCloudinary(
            payload.personalInfo.profile_img,
            "contactx/personal-info/profiles"
          );
        }
      }
    }
    
    // Extract links array from socialLinks object if it exists
    if (payload.socialLinks?.links) {
      payload.socialLinks = payload.socialLinks.links;
    }

    const result = await cardServices.updateCard(id, req.user.id, payload);

    res.status(200).json({
      success: true,
      message: "Card updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Update card error:", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
    next(error);
  }
};

const deleteCard = async (req: Request, res: Response, next: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    
    // Get card to delete images
    try {
      const cardToDelete = await cardServices.getCardById(id, req.user.id);
      
      // Delete images from Cloudinary
      if (cardToDelete) {
        if (cardToDelete.logo) await deleteImageFromCloudinary(cardToDelete.logo);
        if (cardToDelete.profile) await deleteImageFromCloudinary(cardToDelete.profile);
        if (cardToDelete.cover) await deleteImageFromCloudinary(cardToDelete.cover);
        
        // Delete personal info images
        if (cardToDelete.personalInfo) {
          if (cardToDelete.personalInfo.image) await deleteImageFromCloudinary(cardToDelete.personalInfo.image);
          if (cardToDelete.personalInfo.logo) await deleteImageFromCloudinary(cardToDelete.personalInfo.logo);
          if (cardToDelete.personalInfo.banner) await deleteImageFromCloudinary(cardToDelete.personalInfo.banner);
          if (cardToDelete.personalInfo.profile_img) await deleteImageFromCloudinary(cardToDelete.personalInfo.profile_img);
        }
      }
    } catch (error) {
      // Card not found or already deleted, continue with deletion
      console.log("Card not found for image cleanup, continuing with deletion");
    }

    await cardServices.deleteCard(id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
    next(error);
  }
};

// Upload single image for card (logo, profile, cover)
const uploadCardImage = async (req: Request, res: Response, next: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { image, type } = req.body as {
      image: string; // base64 data URI
      type: 'logo' | 'profile' | 'cover';
    };

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    if (!type || !['logo', 'profile', 'cover'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'logo', 'profile', or 'cover'",
      });
    }

    // Determine folder based on type
    const folderMap = {
      logo: "contactx/cards/logos",
      profile: "contactx/cards/profiles",
      cover: "contactx/cards/covers",
    };

    const folder = folderMap[type];
    const url = await uploadImageToCloudinary(image, folder);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url,
      imageUrl: url, // Also include imageUrl for compatibility
    });
  } catch (error: any) {
    console.error("❌ Upload card image error:", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload image",
      });
    }
    next(error);
  }
};

export const cardController = {
  createCard,
  getAllCard,
  updateCard,
  deleteCard,
  uploadCardImage,
};
