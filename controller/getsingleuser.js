const jwt = require('jsonwebtoken');
const _ = require('lodash');
const connect = require('../config/Mysqlcon');
const asyncMiddleware = require('../utils/async');
const Joi = require('joi');
const { GenOTP } = require('../utils/GenOTP');
const sendmail = require('../config/sendmail');
const { validate_prof } = require('../Validate/validate');

exports.getsingleuser = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ 'message': "Access denied.No token provided" });
    try {
        const conn = await connect()
        const decoded = jwt.verify(token, process.env.Private_key);
        const [userdata] = await conn.query('select * from dbt_user where user_id=?', [decoded.user_id])
        if (userdata.length === 0) {
            return res.status(400).json({ status: 0, message: "No user exists by this user_id" })
        }
        res.status(200).send(_.pick(userdata[0], ['first_name', 'last_name', 'email', 'phone', 'status', 'verified', 'image']))
    }
    catch (err) {
        res.status(400).json({ 'message': 'invalid token' });
    }
}






exports.OTP_withdraw = asyncMiddleware(async (decoded, req, res) => {
    let email = req.body;

    const schema = Joi.object({ email: Joi.string().email().required() });
    const { error } = schema.validate(email);
    if (error) return res.status(200).json({ status: 0, message: error.details[0].message });

    const OTP = GenOTP();
    const Conn = await connect();

    const result = await Conn.query('insert into otpg set ?', { email: email.email, OTP: OTP, status: 1 });

    if (result[0].affectedRows) {

        const message = `YOUR OTP IS : ${OTP}`
        try {

            await sendmail({ email: email.email, subject: 'OTP for withdraw', message });

            res.status(200).json({ success: true, data: "otp sent", emailstatus: 1 });

        }
        catch (err) {
            await Conn.query('update otpg set otp=?,status=?', ['0', 0]);

            res.status(500).json({ status: 0, message: "something went wrong.Please try again" });

        }
    }
});




exports.verify_with_OTP = asyncMiddleware(async (decoded, req, res, next) => {

    let data = req.body;

    const schema = Joi.object({
        email: Joi.string().email().required(),
        OTP: Joi.number().required()
    });

    const { error } = schema.validate(data);
    if (error) return res.status(200).json({ status: 0, message: error.details[0].message });

    const Conn = await connect();
    const [result] = await Conn.query('select * from otpg where email=? and OTP=? and status=1', [data.email, data.OTP]);

    if (!result.length) return res.status(200).json({ status: 0, message: "invalid OTP" });

    if (data.OTP == result[0].OTP) {

        await Conn.query('update otpg set status=0 where email=?',[data.email]);
        res.status(200).json({ status: 1, message: "OTP has been succesfully verified" });

    }
    

});





exports.Up_profile = asyncMiddleware(async (decoded, req, res) => {

    let { error,value} = validate_prof(req.body);
    if (error) return res.status(400).json({ staus: 0, message: error.details[0].message });
 
    const Conn=await connect();
    const [result]=await Conn.query('update dbt_user set first_name=?,last_name=?,phone=? where user_id=?',[value.first_name,value.last_name,value.phone,decoded.user_id]);

    if(result.affectedRows) res.status(201).json({status:1,message:"successfully updated your profile"});

});

