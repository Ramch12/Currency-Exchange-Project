const connect = require('../config/Mysqlcon');
const crypto = require('crypto');
const asyncMiddleware = require('../middleware/async');
const bcrypt = require('bcrypt');
const joi = require('joi');

exports.resetPass = asyncMiddleware(async (req, res, next) => {
        const pass = req.body;
        const schema = joi.object({ password: joi.string().min(5).max(255).required() })
        await schema.validateAsync(pass);

        const conn = await connect();

        const resetPasstoken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
        const id = await conn.query('select id from dbt_user where password_reset_token=?', [resetPasstoken]);

        if (!id[0].length) return res.status(400).json({ status: 0, message: "invalid token" });

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(pass.password, salt);
        
        const data=id[0][0].id;
        const result = await conn.query("update dbt_user set password_reset_token=NULL,password=? where id=?",[password,data]);
        console.log(result);
});