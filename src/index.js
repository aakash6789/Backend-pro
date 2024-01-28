
import dotenv from "dotenv";
import connectDB from './db/index.js'
import app from "./app.js";


// Load the configuration
dotenv.config({ path: `../.env`});
const port=process.env.PORT||8000;
connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`Server running at ${port}`)
    })
}).catch((err)=>{
  console.log(err);
})


