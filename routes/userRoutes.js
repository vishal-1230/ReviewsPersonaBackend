import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { addTask_old as addTask, changePassword, createProfileByManager, deleteLinkedProfile, deleteSocial, deleteTask_old as deleteTask, deleteTask_old as deleteTaskId, deleteUser, downloadVCard, getLinkedProfilesDetail, getProfile, getTasks_old as getTasks, getUserById, getUsers, login, markTaskAsDone_old as markTaskAsDone, register, sendOTP, sendWhatsappTrial, updateUser, upgradeToPro, verifyOTP } from "../controllers/userController.js";

// import { userController } from '../controllers/userController';

// const router = express.Router();
const router = Router();

// router.route('/').get(userController.getUsers);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/sendOTP").post(sendOTP)
router.route("/verifyOTP").post(verifyOTP)
router.route("/changePassword").post(changePassword)
router.route("/").get(auth, getProfile);
router.route("/getUsers").get(auth, getLinkedProfilesDetail)
router.route("/deleteLinkedUser/:profileId").delete(auth, deleteLinkedProfile)
router.route("/sendWA").get(sendWhatsappTrial)
router.route("/vcard").get(downloadVCard)
router.route("/:id").get(getUserById);
router.route("/:id").put(auth, updateUser);
router.route("/social").delete(auth, deleteSocial)
router.route("/:id").delete(auth, deleteUser);
router.route("/createUser").post(auth, createProfileByManager);
router.route("/upgrade").post(auth, upgradeToPro)

router.route("/tasks").get(auth, getTasks);
router.route("/tasks").post(auth, addTask);
router.route("/tasks/:id/:taskId").get(auth, markTaskAsDone);
router.route("/tasks/:id").delete(auth, deleteTask);
router.route("/tasks/:id/:taskId").delete(auth, deleteTaskId);



export default router;