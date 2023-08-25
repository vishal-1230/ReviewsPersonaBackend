import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { addToBacklog, addTask, deleteTask, getTasks, markTaskAsDone, editTask } from "../controllers/userController.js";

const router = Router();

router.route("/").get(auth, getTasks);
router.route("/").post(auth, addTask);
router.route("/:id").post(auth, addToBacklog);
router.route("/:id").put(auth, editTask);
router.route("/:id/:taskId").get(auth, markTaskAsDone);
router.route("/:id").delete(auth, deleteTask);
// router.route("/:id/:taskId").delete(auth, deleteTaskId);

export default router;