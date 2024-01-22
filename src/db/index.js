import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDb=async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log("DB connected")
        
    } catch (error) {
        console.log("DB error is ",error);
        throw error;
    }
}
export default  connectDb;