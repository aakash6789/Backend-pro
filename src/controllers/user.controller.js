import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
    const {fullName,email, username, password}=req.body;
   if([fullName,email,username,password].some((field)=> {return field?.trim()===""})){
    throw new ApiError({statusCode:400,message:"All fields are required"})
   }
   const existedUser= await User.findOne({$or:[{username},{email}]});
   if(existedUser){
         throw new ApiError(409,"User already exists!!");
   }
   console.log(req.files);
   const avatarPath=req.files?.avatar[0]?.path;
   const coverImagePath=req.files?.coverImage[0]?.path;
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
    username:username.toLowerCase()
   });
   const createdUser=await User.findById(user._id).select("-password -refreshToken");
   if(!createdUser){
    throw new ApiError(500,"Something went wrong");
   }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"User added sucessfully")
   )
   
});


export {registerUser};