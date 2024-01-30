import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user= await User.findById(userId);
        const acessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        user.save({validateBeforeSave:true});

        return {acessToken,refreshToken};
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
   console.log(req.files);
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

const loginUser=asyncHandler(async(req,res)=>{
   const {username,email,password}=req.body;
   if(!username && !email){
    throw new ApiError(400, "Any one of email or username is required");
   }
   const user=await User.findOne({$or:[{username},{email}]});
   if(!user){
    throw new ApiError(404, "User does not exist, try creating an account first");
   }
   if([username,email].some((field)=> User.exists({field}))){
    const isPassValid=await user.isPasswordCorrect(password);
        if(isPassValid){
           const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
           const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

           const options={
            httpOnly:true,
            secure:true
           }
            return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{loggedInUser,accessToken,refreshToken},"Logged in successfully"));
        }
        throw new ApiError(401, "Incorrect password");
    }
});

const logOutUser=asyncHandler(async(req,res)=>{
    
});


export {registerUser};