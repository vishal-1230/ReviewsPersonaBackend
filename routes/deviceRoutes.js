import { Router } from "express";
import { auth } from "../middlewares/auth.js";

import { activateCard, getDevices, getCard, getDevice, getCards, linkCard, unlinkCard } from "../controllers/deviceController.js";

const router = Router();

router.route("/").get(getDevices);
router.get("/my-cards", auth, getCards)
router.get("/:id", getDevice)
router.get("/reviews/:id", getCard)
router.post("/link", auth, linkCard)
router.post("/unlink", auth, unlinkCard)
router.post("/activate", auth, activateCard)

export default router;