import { Router } from "express";
import { cardController } from "./card.controller";
import { uploadCardImages, uploadPersonalInfoImages } from "../../middleware/upload";

const router = Router();

// Combine both upload middlewares for card creation and update
const uploadAllCardImages = (req: any, res: any, next: any) => {
  uploadCardImages(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    uploadPersonalInfoImages(req, res, next);
  });
};

router.post("/create", uploadAllCardImages, cardController.createCard);
router.get("/all", cardController.getAllCard);
router.put("/update/:id", uploadAllCardImages, cardController.updateCard);
router.delete("/delete/:id", cardController.deleteCard);
router.post("/upload-image", cardController.uploadCardImage);

export const cardRoutes = router;
