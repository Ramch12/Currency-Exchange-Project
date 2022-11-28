const connect = require('../config/Mysqlcon');
const { generateFromEmail } = require('unique-username-generator');
const { validate } = require('../Validate/validate');
const jwt=require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config({Path:'../config/env'});

module.exports = async function createUser(req, res, next) {
    try {
        const conn = await connect();

        const { error } = validate(req.body);
        if (error) return res.status(400).json({ "error": error.details[0].message });

        const user = await conn.query('select email from dbt_user where email=?', [req.body.email]);
        if (user[0].length) return res.status(400).json({ message: "User is already registered" });

        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);

        const userdata = [
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.password,
            req.body.phone
        ]
        userdata.push(generateFromEmail(
            userdata[2],
            3
        ));
        const data = await conn.query('insert into dbt_user(first_name,last_name,email,password,phone,user_id) values(?)', [userdata]);
        if (data.length != 0) {
            const token=jwt.sign({user_id:userdata[5]},process.env.Private_key);
            res.header('x-auth-token',token).json({"message":"succesfully registered"});
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
} 