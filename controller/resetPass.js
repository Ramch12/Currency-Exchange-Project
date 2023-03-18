const connect = require('../config/Mysqlcon');
const crypto = require('crypto');
const asyncMiddleware = require('../utils/async');
const bcrypt = require('bcrypt');
const joi = require('joi');

exports.resetPass = async (req, res, next) => {

        try {

                const pass = req.body;
                const schema = joi.object({ password: joi.string().min(5).max(255).required() });

                await schema.validateAsync(pass);
                const Conn = await connect();
                const resetPasstoken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');


                const [results] = await Conn.query('select * from dbt_user where password_reset_token=?', [resetPasstoken]);
                if (!results.length) return res.status(400).json({ status: 0, message: "invalid link" });

                const salt = await bcrypt.genSalt(10);
                const password = await bcrypt.hash(pass.password, salt);


                const result = await Conn.query("update dbt_user set password_reset_token=NULL,password=? where email=?", [password, results[0].email]);
                if (result[0].affectedRows) res.status(201).json({ status: 1, message: "Your password had been changed succefully" });
                
        }
        catch (err) {
                if (err.code === 'ECONNREFUSED') return res.status(500).json({ status: 0, message: "failed to connect with database" });

                res.status(500).json({ status: 0, message: err.message });
        }
}