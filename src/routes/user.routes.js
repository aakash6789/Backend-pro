import { Router } from "express";
import { registerUser,logOutUser,loginUser,refreshAccessToken } from "../controllers/user.controller.js";
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
router.post('/refresh-token',refreshAccessToken);

export default router;