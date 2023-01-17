const connect = require('../config/Mysqlcon');
const asyncMiddleware = require('../middleware/async');
const crypto = require('crypto');
const joi = require('joi');
const sendmail = require('../config/sendemail');

exports.forgotPass = asyncMiddleware(async (req, res, next) => {
    const schema = joi.object({ email: joi.string().email().min(3).max(255).required() });
    await schema.validateAsync(req.body);
    const conn = await connect();

    const id = await conn.query("select id from dbt_user where email=?", [req.body.email]);
    if (!id[0].length) return res.status(404).json({ status: 0, message: "there is no user with that email" });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasstoken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await conn.query('update dbt_user set password_reset_token=? where id=?', [resetPasstoken, id[0][0].id]);

    const reseturl = `${req.protocol}://${req.get('host')}/resetPass/${resetToken}`;

    const message = `You are recieving this messaage because you or(someone else) has requested the reset of a password
    .plz make a put request to .\n \n ${reseturl}`;

    try {
        await sendmail({
            email: req.body.email,
            subject: 'password reset token',
            message
        });
        res.status(200).json({ success: true, data: "email sent" });
    }
    catch (err) {
        await conn.query('update dbt_user set password_reset_token=NULL where email=?'[req.body.email])
    }


});
