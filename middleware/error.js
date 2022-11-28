module.exports=(err,req,res,next)=>{
    // logging the errors
    console.log("Something failed");
    res.status(500).json({ "message": err.message });
}