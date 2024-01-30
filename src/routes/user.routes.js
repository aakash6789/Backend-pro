import { Router } from "express";
import { registerUser,logOutUser,loginUser } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router();
router.post('/register',upload.fields([{
    name:'avatar',
    maxCount:1
},{
    name:'coverImage',
    maxCount:1
}]),registerUser);
router.post('/login',loginUser);
router.post('/logout',verifyJWT,logOutUser);

export default router;