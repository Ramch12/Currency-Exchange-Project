const { json } = require('express');
const connect = require('../config/Mysqlcon');
const asyncMiddleware = require('../utils/async');
require('dotenv').config({ path: '../config/.env' });
const { withdraw_validate } = require('../Validate/validate');
const { Kyc_validation } = require('../Validate/validate');
const { bank_validation } = require('../Validate/validate');

exports.getuser_log = asyncMiddleware(async (decoded, req, res) => {

        const Conn = await connect();
        const [user_data] = await Conn.query('select * from dbt_user_log where user_id=? order by log_id desc limit 10', [decoded.user_id]);

        if (!user_data.length) return res.status(404).json({ status: 0, message: "No log found for this user" });
        res.status(200).json({ status: 1, user_log: user_data });

})



exports.getBalance = asyncMiddleware(async (decoded, req, res) => {

        const Conn = await connect();
        const [user_data] = await Conn.query('select * from dbt_balance where user_id=?', [decoded.user_id]);

        if (!user_data.length) return res.status(404).json({ status: 0, message: "No balance found for this user" });
        res.status(200).json({ status: 1, user_log: user_data });

});


exports.getBalancelog = asyncMiddleware(async (decoded, req, res) => {

        const Conn = await connect();
        const [user_data] = await Conn.query('select * from dbt_balance_log where user_id=?', [decoded.user_id]);

        if (!user_data.length) return res.status(404).json({ status: 0, message: "No balance log found for this user" });
        res.status(200).json({ status: 1, user_log: user_data });



})


exports.Create_KYC = asyncMiddleware(async (decoded, req, res) => {

        const Conn = await connect();
        let data = {
                user_id: decoded.user_id,
                verify_type: req.body.verify_type,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                gender: req.body.gender,
                id_number: req.body.id_number,
                document1: req.files['document1'][0].path,
                document2: req.files['document2'][0].path,
                document3: req.files['document3'][0].path,
                address: req.body.address
        };

        let { error } = Kyc_validation(data);
        if (error) return res.status(400).json({ status: 0, message: error.details[0].message });



        const [result] = await Conn.query('insert into dbt_user_verify_doc set ?', data);

        const [data1] = await Conn.query('UPDATE dbt_user SET verified=3 WHERE user_id=?', [decoded.user_id]);

        
        if (result.affectedRows && data1.affectedRows) {
                res.status(200).json({ status: 1, message: "Your document has been successfully verified" });
        }


});




exports.bank_payout = asyncMiddleware(async (decoded, req, res) => {

        const Conn = await connect();

        let bank_data = {
                user_id: decoded.user_id,
                currency_symbol: req.body.currency_symbol,
                method: req.body.method,
                wallet_id: ({
                        acc_name: req.body.acc_name,
                        acc_no: req.body.acc_no,
                        branch_name: req.body.branch_name,
                        ifsc_code: req.body.ifsc_code,
                        upi: req.body.upi,
                        type: req.body.type,
                        bank_name: req.body.bank_name
                }),
                image: req.file.filename,
        }

        let { error } = bank_validation(bank_data);
        if (error) return res.status(400).json({ status: 0, message: error.details[0].message });

        bank_data.wallet_id = JSON.stringify(bank_data.wallet_id);

        const [result] = await Conn.query('insert into dbt_payout_method set ?', bank_data);
        if (result.affectedRows) return res.status(201).json({ status: 1, message: "successully uploaded" });
})





exports.Getuser_add = asyncMiddleware(async (decoded, req, res, next) => {

        const Conn = await connect();
        const [result] = await Conn.query('select address from dbt_address where user_id=?', [decoded.user_id]);

        if (!result.length) return res.status(404).json({ status: 0, message: "No address found for this user" });
        res.status(200).json({ status: 1, addresses: result });

});



exports.Gettrans_hist = asyncMiddleware(async (decoded, req, res) => {

        const Conn = await connect();
        const [result] = await Conn.query('select * from  transaction_history where user_id=?', [decoded.user_id]);

        if (!result.length) return res.status(404).json({ status: 0, message: "No transaction history found for this user" });
        res.status(200).json({ status: 1, transaction_history: result });


});



exports.createWithdraw = asyncMiddleware(async (decoded, req, res,) => {

        const conn = await connect();

        const { error } = withdraw_validate(req.body);
        if (error) return res.status(200).json({ status: 0, message: error.details[0].message });

        let data = [
                req.body.currency_symbol,
                req.body.amount,
                req.body.fees_amount,
                req.body.request_Date,
                req.body.ip,
                req.body.wallet_id
        ]

        const result = await conn.query('insert into dbt_withdraw(currency_symbol,amount,fees_amount,request_Date,ip,wallet_id) value(?)', [data]);
        if (result[0].affectedRows) res.status(201).json({ status: 1, success: true, message: "successfully Inserted" });

})














exports.getcoin = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query('select * from dbt_coinpair where status=1');
        res.status(200).send(data[0]);
});



exports.getcryptocoin = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query('select * from dbt_cryptocoin where status=1');
        res.status(200).send(data[0]);
});



exports.coinhistory = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query('select * from dbt_coinhistory');
        res.status(200).send(data[0]);
});



exports.openorder = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and market_symbol=?", [req.query.market_symbol]);
        res.status(200).send(data[0]);
});



exports.openbuyorder = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and bid_type='BUY' and market_symbol=?", [req.query.market_symbol]);
        res.status(200).send(data[0]);
});


exports.opensellorder = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and bid_type='SELL' and market_symbol=?", [req.query.market_symbol]);
        res.status(200).send(data[0]);
});


exports.openorderst1 = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and market_symbol=?", [req.query.market_symbol]);
        res.status(200).send(data[0]);
});


exports.openorderst2 = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and market_symbol=? and user_id=?", [req.query.market_symbol, req.query.user_id]);
        res.status(200).send(data[0]);
});



exports.openorderst3 = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=1 and user_id=?", [req.query.user_id]);
        res.status(200).send(data[0]);
});



exports.openorderst4 = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and market_symbol=? and user_id=?", [req.query.market_symbol, req.query.user_id]);
        res.status(200).send(data[0]);
});


exports.openorderst4 = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and market_symbol=? and user_id=?", [req.query.market_symbol, req.query.user_id]);
        res.status(200).send(data[0]);
});

exports.openorderst4 = asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and user_id=?", [req.query.user_id]);
        res.status(200).send(data[0]);
});

exports.openorderst5 = asyncMiddleware(async (req, res) => {
        console.log(req.body);
        const conn = await connect();
        const data = await conn.query("insert into dbt_biding set ?", req.body);
        res.status(200).send(data);
});




