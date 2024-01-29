import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config({ path: '../.env'});
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloudinary=async(localfilePath)=>{
    const options = {
        resource_type:"auto",
      };
  
      try {
        const result = await cloudinary.uploader.upload(localfilePath, options);
        console.log("File uploaded successfully: ",result.url);
        fs.unlinkSync(localfilePath);
        return result;
        
      } catch (error) {
        fs.unlinkSync(localfilePath);
        console.error(error);
        return null;
      }

}

export {uploadOnCloudinary};
          


