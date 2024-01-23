const asyncHandler=(func)=>{
 ()=>{
    Promise.resolve(func(req,res,next)).catch((err)=>next(err));
 }
}
export {asyncHandler};