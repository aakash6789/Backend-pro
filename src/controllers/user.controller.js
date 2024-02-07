import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary,deleteImageOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user= await User.findById(userId);
        const accessTokenPr=user.generateAccessToken();
        const refreshTokenPr=user.generateRefreshToken();
        let refreshToken;
        await refreshTokenPr.then((token)=>{refreshToken=token})
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessTokenPr,refreshTokenPr};
    } catch (error) {
        throw new ApiError(500,"Something went wrong with token generation");
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    const {fullName,email, username, password}=req.body;
   if([fullName,email,username,password].some((field)=> {return field?.trim()===""})){
    throw new ApiError({statusCode:400,message:"All fields are required"})
   }
   const existedUser= await User.findOne({$or:[{username},{email}]});
   if(existedUser){
         throw new ApiError(409,"User already exists!!");
   }
//    console.log(req.files);
   const avatarPath=req.files?.avatar[0]?.path;
   let coverImagePath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
       coverImagePath = req.files.coverImage[0].path
   }
   if(!avatarPath){
    throw new ApiError(400,"Avatar file is needed");
   }
   const avatar=await uploadOnCloudinary(avatarPath);
   const coverImage=await uploadOnCloudinary(coverImagePath);
   if(!avatar){
    throw new ApiError(400,"Avatar file is needed");
   }
  const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username:username.toLowerCase(),
    refreshToken:""
   });
   const createdUser=await User.findById(user._id).select("-password -refreshToken");
   if(!createdUser){
    throw new ApiError(500,"Something went wrong");
   }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"User added sucessfully")
   )
   
});

const loginUser=asyncHandler(async(req,res)=>{
   const {username,email,password}=req.body;
//    console.log(req.body);
   if(!username && !email){
    throw new ApiError(400, "Any one of email or username is required");
   }
   const user=await User.findOne({$or:[{username},{email}]});
   if(!user){
    throw new ApiError(404, "User does not exist, try creating an account first");
   }
//    if([username,email].some((field)=> User.exists({field}))){
    const isPassValid=await user.isPasswordCorrect(password);
        if(isPassValid){
           const {accessTokenPr,refreshTokenPr}=await generateAccessAndRefreshToken(user._id);
           let accessToken;
           let refreshToken;
           await accessTokenPr.then((token)=>{
            accessToken=token;
           }).catch(error => {
            console.error('accessToken promise Error:', error);
        });
           await refreshTokenPr.then((token)=>{
            refreshToken=token;
           }).catch(error => {
            console.error('refreshToken promise Error:', error);
        });
        //    console.log(at);
        //    console.log("rt is");
        //    console.log(rt);
           const loggedInUser=await User.findById(user._id).select("-password -refreshToken");
           const options={
            httpOnly:true,
            secure:true
           }
            return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options ).json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"Logged in successfully"));
        }
        throw new ApiError(401, "Incorrect password");
    // }
});

const logOutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    $set:{refreshToken:undefined}
  })
  const options={
    httpOnly:true,
    secure:true
   }
   return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"Logged out successfully"));
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incRefreshToken=req.cookies.refreshToken||req.body.refreshToken;
    if(!incRefreshToken){
        throw new ApiError(401,"Unauthorized req Refresh token does not exist")
    }
   const decodedToken= await jwt.verify(incRefreshToken,process.env.REFRESH_TOKEN_SECRET);
   const user=await User.findById(decodedToken?._id);
   if(!user){
    throw new ApiError(401,"Invalid refresh token");
}
if(!user.refreshToken){
    throw new ApiError(401,"User Refresh token does not exist");
}
if(incRefreshToken!==user.refreshToken){
    throw new ApiError(401,"Refresh token is invalid or expired");
}
const {refreshToken,accessToken}=await generateAccessAndRefreshToken(user._id);
const options={
    httpOnly:true,
    secure:true
}

return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{accessToken,refreshToken},"AcessToken rengerenated sucessfully"))
})

const updatePassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassowrd}=req.body;

    const user=await user.findById(req.user?._id);
    if(!user){
        throw new ApiError(404,"User does not exist");
    }
    const isPasscorrect=await user.isPasscorrect(oldPassword);
    if(!isPasscorrect){
        throw new ApiError(400,"Password does not match");
    }
    user.password=newPassowrd;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"));
})

const getCurrUser=asyncHandler(async(req,res)=>{
    if(!req.user){
        throw new ApiError(401,"User is not logged in, bad request")
    }
    return res.status(200).json(200,req.user,"User details fetched successfully")
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body;
    if(!fullName && !email){
        throw new ApiError(400,"All fields are required");
    }
    const user=User.findByIdAndUpdate(req.user?._id,{$set:{fullName,email}},{new:true}).select("-password");

    return res.status(200).json(new ApiResponse(200,user,"User details updated successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarPath=req.file?.path;
    if(!avatarPath){
        throw new ApiError(400,"Avatar file is needed");
    }
    const avatar=await uploadOnCloudinary(avatarPath);
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar ");
    }
    const oldavatarImage=User.findById(req.user?._id)?.avatar;
    await deleteImageOnCloudinary(oldavatarImage);
    const user=User.findByIdAndUpdate(req.user?._id,{$set:{avatar:avatar.url}},{new:true}).select("-password");
    return res.status(200).json(new ApiResponse(200,user,"User avatar updated successfully"))

})
const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImagePath=req.file?.path;
    if(!coverImagePath){
        throw new ApiError(400,"Cover image is needed");
    }
    const coverImage=await uploadOnCloudinary(coverImagePath);
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage ");
    }
    const oldCoverImage=User.findById(req.user?._id)?.coverImage;
    await deleteImageOnCloudinary(oldCoverImage);
    const user=User.findByIdAndUpdate(req.user?._id,{$set:{coverImage:coverImage.url}},{new:true}).select("-password");
    return res.status(200).json(new ApiResponse(200,user,"User coverImage updated successfully"))

})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;
    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username.toLowerCase(),
            }
        },
        {
             $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscibrers"
             }
        },
        {
             $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscibredTo"
             }
        },
        {
          $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },
            channelSubscriberedToCount:{
                $size:"$subscribedTo"
            },
            isSubscribed:{
                $cond:{
                    if:{$in: [req.user?._id ,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
          }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelSubscriberedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
                
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist");
    }
    return res.status(200).json(new ApiResponse(200,channel[0],"User channel fetched successfully"))
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        },
                       
                    },
                    {
                        $addFields:{
                            owner:{
                                $arrayElemeAt:["$owner",0]
                            }
                        }
                    }
                   
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"Watch History fetched successfully"))
})
export {registerUser,logOutUser,loginUser,refreshAccessToken,getCurrUser,updatePassword,updateUserAvatar,updateUserCoverImage,updateAccountDetails,getUserChannelProfile,getWatchHistory};