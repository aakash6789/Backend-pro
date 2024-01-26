import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


const uploadOnCloudinary=async(localfilePath,fileName)=>{
    const options = {
        resource_type:auto
      };
  
      try {
        const result = await cloudinary.uploader.upload(localfilePath, options);
        console.log("File uploaded successfully: ",result.url);
        return result;
        
      } catch (error) {
        fs.unlinkSync(localfilePath);
        console.error(error);
        return null;
      }

}
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET 
});

cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });