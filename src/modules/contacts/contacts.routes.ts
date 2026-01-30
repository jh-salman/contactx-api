import { Router } from "express";
import { contactController } from "./contacts.controller";

const router = Router();

// ✅ Step 2: Visitor saves Owner's contact (NO permission needed)
router.post("/save/:cardId", contactController.saveContactController);

// Existing contact CRUD routes
router.get("/all", contactController.getAllContactsController);
router.put("/update/:contactId", contactController.updateContactController);
router.delete("/delete/:contactId", contactController.deleteContactController);

<<<<<<< HEAD
// ✅ Step 4: Visitor shares their contact with Owner
router.post("/visitor/share-contact", contactController.shareVisitorContactController);

// ✅ Step 5: Owner gets pending visitor shares
router.get("/visitor/pending-shares", contactController.getPendingVisitorSharesController);

// ✅ Step 6: Owner approves/rejects visitor share
router.post("/visitor/approve-share/:shareId", contactController.approveVisitorShareController);
router.post("/visitor/reject-share/:shareId", contactController.rejectVisitorShareController);

// Optional: Contact request routes (Owner requests Customer's contact)
router.post("/request/:cardId", contactController.requestContactPermissionController);
router.get("/requests/received", contactController.getReceivedRequestsController);
router.get("/requests/sent", contactController.getSentRequestsController);
router.post("/requests/:requestId/approve", contactController.approveRequestController);
router.post("/requests/:requestId/reject", contactController.rejectRequestController);

export const contactRoutes = router;
=======
// Flow 2: Permission-based contact requests
// POST /contacts/request/:cardId - Request to save contact (Owner requests Customer's contact)
router.post("/request/:cardId", contactController.requestContactPermissionController);

// GET /contacts/requests/received - Get received requests (Customer sees Owner's requests)
router.get("/requests/received", contactController.getReceivedRequestsController);

// GET /contacts/requests/sent - Get sent requests (Owner sees their requests)
router.get("/requests/sent", contactController.getSentRequestsController);

// POST /contacts/requests/:requestId/approve - Approve request (Customer approves)
router.post("/requests/:requestId/approve", contactController.approveRequestController);

// POST /contacts/requests/:requestId/reject - Reject request (Customer rejects)
router.post("/requests/:requestId/reject", contactController.rejectRequestController);

// POST /contacts/request-reverse - Create reverse permission request
// When customer saves owner's contact, automatically create request from owner to customer
router.post("/request-reverse", contactController.createReversePermissionRequestController);

export const contactRoutes = router;
>>>>>>> features/scan-contact
