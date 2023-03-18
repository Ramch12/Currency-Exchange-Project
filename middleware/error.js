module.exports=(err,req,res,next)=>{
    
        if (err.code === 'ECONNREFUSED') return res.status(500).json({ status: 0, message: "failed to connect with database" });

        res.status(500).json({ status: 0, message: err.message });
}
