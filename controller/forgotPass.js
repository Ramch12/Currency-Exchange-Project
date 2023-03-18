const connect = require('../config/Mysqlcon');
const asyncMiddleware = require('../utils/async');
const crypto = require('crypto');
const joi = require('joi');
const sendmail = require('../config/sendmail');
const { result } = require('lodash');

exports.forgotPass = async (req, res, next) => {

    try {
        const schema = joi.object({ email: joi.string().email().min(3).max(255).required() });
        await schema.validateAsync(req.body);

        const conn = await connect();
        console.log(req.body.email);

        const [results] = await conn.query("select * from dbt_user where email=?", [req.body.email]);

        console.log(results);

        if (!results.length) return res.status(404).json({ status: 0, message: "Invalid email" });

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasstoken = crypto.createHash('sha256').update(resetToken).digest('hex');

        await conn.query('update dbt_user set password_reset_token=? where email=?', [resetPasstoken, results[0].email]);

        const reseturl = `${req.protocol}://${req.get('host')}/resetPass/${resetToken}`;

        const message = `You are recieving this messaage because you or(someone else) has requested the reset of a password
    .plz make a put.\n \n ${reseturl}`;

        try {
            await sendmail({
                email: req.body.email,
                subject: 'password reset token',
                message
            });
            res.status(200).json({ success: true, status: 1, message: `A password reset link has been sent to your email` });
        }
        catch (err) {
            res.status(500).json({ status: 0, message: err.message });
        }


    }
    catch (err) {
        if (err.code === 'ECONNREFUSED') return res.status(500).json({ status: 0, message: "failed to connect with database" });

        res.status(500).json({ status: 0, message: err.message });
    }

};
