const { authValidate } = require('../Validate/validate');
const connect = require('../config/Mysqlcon');
const jwt=require('jsonwebtoken');
require('dotenv').config({path:'./config/.env'});
const bcrypt = require('bcrypt');
exports.loginUser = async (req, res, next) => {
    try {
        const conn = await connect();

        const { error } = authValidate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const data = await conn.query("select * from dbt_user where email=?", [req.body.email]);
        if (!data[0].length) return res.status(400).json({ message: "Invalid email or password" });
         
        
        const validatePass = await bcrypt.compare(req.body.password, data[0][0].password);
        if (!validatePass) return res.status(400).json({ message: "invalid email or password" });
        
        
       const token=jwt.sign({user_id:data[0][0].user_id},process.env.Private_key);
       res.send(token);
    }
    catch (err) {
        res.status(500).json({ "message": err.message });
    }

}