import { Router } from "express";
import { publicCardController } from "./publicCard.controller";

const router = Router();

router.get("/:id", publicCardController.getPublicCardController);

export const publicCardRoutes = router;