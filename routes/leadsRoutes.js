import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { assignLead, createLead, deleteLead, editLeadFormTemplate, getLeadById, getLeads } from "../controllers/leadsController.js";


const router = Router();

router.route('/').get(auth, getLeads);
router.route('/').post(createLead);
router.route("/").put(auth, editLeadFormTemplate);
router.route("/assign").post(auth, assignLead)
router.route('/:id').get(auth, getLeadById);
router.route('/:id').delete(auth, deleteLead);

export default router;