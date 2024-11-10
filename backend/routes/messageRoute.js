import express from "express";
import isAuthenticate from "../middlewares/usAuthenticate.js";
import upload from "../middlewares/multer.js";
import { getMessage, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.route('/send/:id').post(isAuthenticate , sendMessage);
router.route('/all/:id').get(isAuthenticate , getMessage);

export default router;
