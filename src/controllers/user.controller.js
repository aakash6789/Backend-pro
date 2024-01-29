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
   const existedUser= await User.find({$or:[username,email]});
   if(existedUser){
         throw new ApiError({statusCode:409,message:"User already exists!!"});
   }
   const avatarPath=req.files?.avatar[0]?.path;
   const coverImagePath=req.files?.coverImage[0]?.path;
   console.log(req.file);
   if(!avatarPath){
    throw new ApiError({statusCode:400,message:"Avatar file is needed"});
   }
   const avatar=await uploadOnCloudinary(avatarPath);
   const coverImage=await uploadOnCloudinary(coverImagePath);
   if(!avatar){
    throw new ApiError({statusCode:400,message:"Avatar file is needed"});
   }
  const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username:username.toLowerCase()
   });
   const createdUser=User.findById(user._id).select("-password -refreshToken");
   if(!createdUser){
    throw new ApiError({statusCode:500,message:"Something went wrong"});
   }
   return res.status(201).json(
    new ApiResponse({statusCode:200,createdUser,message:"User added sucessfully"})
   )
   
});


export {registerUser};