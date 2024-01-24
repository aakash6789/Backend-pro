import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    watchHistory:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'Video'
    },
    username:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        require:true,
        unique:true,
        trim:true
    },
    fullName:{
        type:String,
        require:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,
        require:true,
    },
    coverImage:String,
    password:{
        type:String,
        require:[true, "Password is required"]
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true})

const User=mongoose.model('User',userSchema);

export default User;