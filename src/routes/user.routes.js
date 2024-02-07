import { Router } from "express";
import { registerUser,logOutUser,loginUser,refreshAccessToken,updatePassword,getCurrUser,updateAccountDetails, updateUserAvatar, updateUserCoverImage,getUserChannelProfile,getWatchHistory } from "../controllers/user.controller.js";
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
router.post('/change-pass',verifyJWT,updatePassword);
router.get('/curr-user',verifyJWT,getCurrUser);
router.patch('/updateAcc',updateAccountDetails);
router.patch('/updateAva',verifyJWT,upload.single("avatar"),updateUserAvatar);
router.patch('/updateCov',upload.single("coverImage"),updateUserCoverImage);
router.get("/c/:username",verifyJWT,getUserChannelProfile);
router.get("/history",verifyJWT,getWatchHistory);

export default router;