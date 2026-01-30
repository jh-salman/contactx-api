import { Request, Response } from "express";
import { cardServices } from "./card.services";




const createCard = async (
  req: Request,
  res: Response,
  next: any
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user?.id
    console.log(userId)
    const {
      cardTitle,
      cardColor,
      logo,
      profile,
      cover,
      imagesAndLayouts,
      isFavorite,
      personalInfo,
      socialLinks,
      
    } = req.body;

    // Extract links array from socialLinks object if it exists
    const socialLinksArray = socialLinks?.links || (Array.isArray(socialLinks) ? socialLinks : undefined);

    const result = await cardServices.createCard(
      userId,
      cardTitle,
      cardColor,
      logo,
      profile,
      cover,
      imagesAndLayouts,
      isFavorite,
      personalInfo,
      socialLinksArray,
      
    );

    res.status(201).json({
      success: true,
      message: "Card created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCard = async (req: Request, res: Response) => {
  // Logic to get a card
  const userId = req.user?.id as string;
  const result = await cardServices.getAllCard(userId);
  res.status(200).json({
    success: true,
    message: "Card details",
    data: result
  });
};


const updateCard = async (req: Request, res: Response, next: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    
    // Extract links array from socialLinks object if it exists
    const payload = { ...req.body };
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
    // prevent sending headers twice
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
    // also call next(error) if you have global error logging
    next(error);
  }
};



const deleteCard = async (req: Request, res: Response, next: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };

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


export const cardController = {
  createCard,
  getAllCard,
  updateCard,
  deleteCard
};