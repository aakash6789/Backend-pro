import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
import cookieParser from "cookie-parser";


export const verifyJWT=asyncHandler(async(req,res,next)=>{
   try {
  
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log(req);
     console.log("vat is",token);
     if(!token){
         throw new ApiError(401,"Unauthorized request");
     }
     const decodedToken= await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
     if(!user){
         throw new ApiError(401,"Invalid access token");
     }
     req.user=user;
     next();
   } catch (error) {
    throw new ApiError(401,error?.message||"Invalid access token");
   }
})

  //  const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWI3OTg4MDBkN2UyYTk5YWY2ODk5MDUiLCJlbWFpbCI6Im1hZDQxQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoibWFkMTQyIiwiZnVsbE5hbWUiOiJNYWdpdHEiLCJpYXQiOjE3MDY3MDMwNTMsImV4cCI6MTcwNjc4OTQ1M30.V6XxaE9LP-w6EcPXexdwVHjfFManhu02-CyB-_nLkik";