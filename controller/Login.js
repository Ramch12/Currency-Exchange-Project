const { authValidate } = require('../Validate/validate');
const connect = require('../config/Mysqlcon');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './config/.env' });
const bcrypt = require('bcrypt');
const sendmail = require('../config/sendmail');
const Joi = require('joi');
const {GenOTP}=require('../utils/GenOTP');

exports.loginUser = async (req, res, next) => {
    try {
        const conn = await connect();

        const { error } = authValidate(req.body);
        if (error) return res.status(400).json({ status: 0, message: error.details[0].message });

        const [data] = await conn.query("select * from dbt_user where email=?", [req.body.email]);
        if (!data.length) return res.status(404).json({ status: 0, message: "user not found" });
        

        const validatePass = await bcrypt.compare(req.body.password, data[0].password);
        if (!validatePass) return res.status(400).json({ status: 0, message: "invalid email or password" });
        
        if(data[0].googleauth) return res.status(401).json({status:1,emailstatus:0});

        // else if (data[0].verified === 3) return res.status(401).json({ status: 0, message: " please verify your account" });
        
        const otptoken =GenOTP();
        const otpresult = await conn.query('insert into otpg set ?', { email: req.body.email, otp: otptoken, status: 1 });
        
        if(otpresult[0].affectedRows){

            const message = `YOUR OTP IS : ${otptoken}`
            try {
    
                await sendmail({ email: req.body.email, subject: 'OTP for login',message });
    
                res.status(200).json({ success: true, data: "otp sent",emailstatus:1});
    
            }
            catch (err) {
                await conn.query('update otpg set otp=?',['0']);
    
                res.status(500).json({ status: 0, message: "something went wrong.Please try again" });
    
            }
            
        }




    }
    catch (err) {
        res.status(500).json({ status: 0, "message": err.message });
    }

}





exports.verifyOTP = async (req, res, next) => {

    try {
        
        const schema = Joi.object({ otp: Joi.number().required(), email: Joi.string().min(5).max(255).required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ status: 0, message: error.message });

        const conn = await connect();
        const [data] = await conn.query('select * from otpg where otp=? and email=? and status=1', [req.body.otp, req.body.email]);

        if (data.length === 0) {
            return res.status(400).json({ status: 0, mesage: "Invalid OTP" });
        }

        const [data1] = await conn.query('select user_id from dbt_user where email=?', [data[0].email]);

        const token = jwt.sign({ user_id: data1[0].user_id }, process.env.Private_key);
        res.header('x-auth-token', token).json({ status: 1, message: "successfully Logged in", token: token });

        await conn.query('update otpg set status=0 where otp=?', [req.body.otp]);


    }
    catch (err) {
        res.status(500).json({ status: 0, message: err.message })
    }
}

