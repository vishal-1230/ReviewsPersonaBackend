import { Router } from "express";

import { auth } from "../middlewares/auth.js";
import { getMessages, sendMessage } from "../controllers/userController.js";

const router = Router();

router.route("/").get(auth, getMessages);
router.route("/").post(auth, sendMessage);

export default router;