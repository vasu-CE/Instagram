import express from "express";
import upload from "../middlewares/multer.js"
import isAuthenticate from "../middlewares/usAuthenticate.js";
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getCommentsOfPost, getMyPost, likePost } from "../controllers/postController.js";

const router = express.Router();

router.route('/addpost').post(isAuthenticate , upload.single('image') ,addNewPost)
router.route('/all').get(isAuthenticate ,getAllPost)
router.route('/userpost/all').get(isAuthenticate ,getMyPost)
router.route('/:id/like').get(isAuthenticate ,likePost)
router.route('/:id/dislike').get(isAuthenticate ,dislikePost)
router.route('/:id/comment').post(isAuthenticate ,addComment)
router.route('/:id/comment/all').post(isAuthenticate ,getCommentsOfPost)
router.route('/delete/:id').delete(isAuthenticate,deletePost)
router.route('/:id/bookmark').post(isAuthenticate,bookmarkPost)

export default router;
