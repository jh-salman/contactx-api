import { Router } from "express";
import { scanController } from "./scan.controller";

const router = Router();

// QR বা link access → scan track + card data return
router.get("/:cardId", scanController.trackScanController);

export const scanRoutes = router;
