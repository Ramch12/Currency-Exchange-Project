const connect = require('../config/Mysqlcon');
// const { generateFromEmail } = require('unique-username-generator');
const { validate } = require('../Validate/validate');
const bcrypt = require('bcrypt');
require('dotenv').config({ Path: '../config/env' });
const sendmail = require('../config/sendmail');
const crypto = require('crypto');
const {gen_username}=require('../utils/GenOTP');

module.exports.createUser = async function (req, res, next) {

    try {

        const conn = await connect();

        const { error } = validate(req.body);
        if (error) return res.status(400).json({ status: 0, "error": error.details[0].message });

        const [id] = await conn.query("select * from dbt_user where referral_id=?", [req.body.referral_id]);
        if (!id.length) return res.status(400).json({ status: 0, message: "Not authorized for registration" });

        const [user] = await conn.query('select email from dbt_user where email=?', [req.body.email]);

        if (user.length) return res.status(400).json({ message: "User is already registered", status: 0 });

        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        req.body.verified = 3;
        const userdata = [
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.password,
            req.body.phone,
            req.body.referral_id,
            req.body.verified,
            0
        ]
        userdata.push(gen_username()
        .toUpperCase());


        const data = await conn.query('insert into dbt_user(first_name,last_name,email,password,phone,referral_id,verified,status,user_id) values(?)', [userdata]);
        if (data[0].affectedRows) {

            const verifyToken = crypto.randomBytes(20).toString('hex');

            const verifyPasstoken = crypto.createHash('sha256').update(verifyToken).digest('hex');


            await conn.query('update dbt_user set password_reset_token=? where email=?', [verifyPasstoken, req.body.email]);

            const reseturl = `${req.protocol}://${req.get('host')}/verify_acc/${verifyToken}`;

            const message = `You are recieving this messaage to verify your account.Please make a put request to verify your account\n \n ${reseturl}`;

            try {

                await sendmail({

                    email: req.body.email,
                    subject: 'Verify Your account',
                    message

                });

                res.status(200).json({ success: true, message: "link for verifying your account has been sent to your email" });
            }

            catch (err) {

                await conn.query('update dbt_user set password_reset_token=NULL where email=?',[req.body.email]);

                if (err.code === 'ECONNREFUSED') return res.status(500).json({ status: 0, message: "failed to connect with database" });

                res.status(500).json({ status: 0, message: err.message });

            }

        }

    }
    catch (err) {
        res.status(500).json({ status: 0, message: err.message })
    }
}



exports.verify_acc = async (req, res, next) => {

    try {

        const conn = await connect();

        const verify_pass_token = crypto.createHash('sha256').update(req.params.verify_token).digest('hex');

        const [result] = await conn.query("select id from dbt_user where password_reset_token=?", [verify_pass_token]);

        if (!result.length) return res.status(400).json({ status: 0, message: "invalid link" });


        const [data] = await conn.query('update dbt_user set verified=1,status=1 where id=?', result[0].id);
        
        if(data.affectedRows) res.status(201).json({ status: 1, message: "Your account has been successfully verified" });
    }
    catch (err) {

        if (err.code === 'ECONNREFUSED') return res.status(500).json({ status: 0, message: "failed to connect with database" });

        res.status(500).json({ status: 0, message: err.message });
        
    }

}