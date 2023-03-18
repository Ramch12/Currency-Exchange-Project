const express = require('express')
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
const jwt = require('jsonwebtoken')
const app = express()
const connect = require('../config/Mysqlcon');
require('dotenv').config({path:"../config/.env"});



app.use(express.json());

exports.signup_2fa = async (req, res) => {

    try {
        
        const email = req.body.email,
        secret = authenticator.generateSecret();
        const Conn = await connect();

        const [result] = await Conn.query('select * from dbt_user where email=?', [email]);
        if (!result.length) return res.status(400).json({ status: 0, message: "please first register yourself" });

        // we need to strore these things in database

        const [data] = await Conn.query('update dbt_user set googleauth=? where email=?', [secret, email]);

        QRCode.toDataURL(authenticator.keyuri(email, '2FA Node App', secret), (err, url) => {
            if (err) {
                throw err
            }
            res.status(200).json({ status: 1, qr: url });
        });

    }
    catch (err) {
        res.status(500).json({status: 0, message: err.message });
    }
}



exports.verify_2fa=function(req, res){

    const email = req.body.email,
          code = req.body.code;
    return verifyLogin(email, code, req, res);

}



async function verifyLogin(email, code, req, res) {
    try{
        // load user by email
        const Conn = await connect();
    
        const [result] = await Conn.query('select googleauth from dbt_user where email=?', [email]);
    
        console.log(result);
    
        if (!result.length) return res.status(400).json({ status: 0, message: "invalid code" });
    
    
        if (!authenticator.check(code, result[0].googleauth)) {
           return res.status(400).json({ status: 0, message: "invalid code" });
        }
    
        token = jwt.sign({email:email},process.env.Private_Key);
        res.status(200).json({ status: 1, token: token });
    }
    catch(err)
    {   

        if (err.code === 'ECONNREFUSED') return res.status(400).json({ status: 0, message: "failed to connect with database" });

        res.status(500).json({status: 0, message: err.message }); 
    }
}


exports.disable_gauth=async(decoded,req,res,next)=>{
    try{
        console.log("Hii");
        const Conn=await connect();
        const [result]=await Conn.query("update dbt_user set googleauth=NULL where user_id=?",[decoded.user_id]);
        res.status(200).json({status:1,message:"successfully disabled"});
    }
    catch(err)
    {

        if (err.code === 'ECONNREFUSED') return res.status(400).json({ status: 0, message: "failed to connect with database" });

        res.status(500).json({status: 0, message: err.message });

    }
}