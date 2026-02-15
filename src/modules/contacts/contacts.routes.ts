import { Router } from "express";
import { contactController } from "./contacts.controller";

const router = Router();

// ✅ Step 2: Visitor saves Owner's contact (NO permission needed)
router.post("/save/:cardId", contactController.saveContactController);

// Existing contact CRUD routes
router.get("/all", contactController.getAllContactsController);
router.put("/update/:contactId", contactController.updateContactController);
router.delete("/delete/:contactId", contactController.deleteContactController);

// POST /contacts/visitor/share-contact - Scanner shares their card with scanned person (auto-saves on owner)
router.post("/visitor/share-contact", contactController.shareVisitorContactController);

export const contactRoutes = router;
