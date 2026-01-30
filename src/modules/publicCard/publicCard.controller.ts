import { Request, Response, NextFunction } from "express";
import { publicCardServices } from "./publicCard.services";

const getPublicCardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string }; // expects /public/:id

    if (!id) {
      return res.status(400).json({ success: false, message: "Card ID is required" });
    }

    const card = await publicCardServices.getPublicCard(id);

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error: any) {
    // forward the error to global error handler
    next(error);
  }
};

export const publicCardController = {
  getPublicCardController,
};
