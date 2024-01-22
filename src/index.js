// require('dotenv').config({path:'./env'});
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import connectDB from './db/index.js'


// Load the configuration
dotenv.config({ path: `../.env`});
const app=express();
const port=process.env.PORT;
connectDB();


