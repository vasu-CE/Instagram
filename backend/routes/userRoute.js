import express from "express";
import { editProfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, register } from "../controllers/userController.js";
import isAuthenticate from "../middlewares/usAuthenticate.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticate , getProfile);
router.route('/profile/edit').post(isAuthenticate , upload.single('profilePhoto') , editProfile);
router.route('/suggested').get(isAuthenticate , getSuggestedUsers);
router.route('/followOrUnfollow/:id').post(isAuthenticate , followOrUnfollow);

export default router;
