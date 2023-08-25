import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { deleteOrder, getOrderById, getUserOrders, orderCard } from "../controllers/orderController.js";


const router = Router();

router.route("/").get(auth, getUserOrders);
router.route("/").post(auth, orderCard);
router.route("/:id").get(auth, getOrderById);
router.route("/:id").delete(auth, deleteOrder);

export default router;