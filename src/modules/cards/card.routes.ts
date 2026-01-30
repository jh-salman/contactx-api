import { Router } from "express";
import { cardController } from "./card.controller";

const router = Router();

router.post("/create", cardController.createCard);
router.get("/all", cardController.getAllCard);
router.put("/update/:id", cardController.updateCard);
router.delete("/delete/:id", cardController.deleteCard);

export const cardRoutes = router;