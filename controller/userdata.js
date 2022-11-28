const connect = require('../config/Mysqlcon');
const asyncMiddleware = require('../middleware/async');

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



exports.coinhistory =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query('select * from dbt_coinhistory');
        res.status(200).send(data[0]);
});



exports.openorder =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and market_symbol=?", [req.query.market_symbol]);
        res.status(200).send(data[0]);
    });



exports.openbuyorder =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and bid_type='BUY' and market_symbol=?", [req.query.market_symbol]);
        res.status(200).send(data[0]);
});


exports.opensellorder =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and bid_type='SELL' and market_symbol=?", [req.query.market_symbol]);
        res.status(200).send(data[0]);
});


exports.openorderst1 =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=1 and market_symbol=?", [req.query.market_symbol]);
        res.status(200).send(data[0]);
});


exports.openorderst2 =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=1 and market_symbol=? and user_id=?", [req.query.market_symbol, req.query.user_id]);
        res.status(200).send(data[0]);
});



exports.openorderst3 =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=1 and user_id=?", [req.query.user_id]);
        res.status(200).send(data[0]);
});



exports.openorderst4 =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and market_symbol=? and user_id=?", [req.query.market_symbol, req.query.user_id]);
        res.status(200).send(data[0]);
});


exports.openorderst4 =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and market_symbol=? and user_id=?", [req.query.market_symbol, req.query.user_id]);
        res.status(200).send(data[0]);
});

exports.openorderst4 =asyncMiddleware(async (req, res) => {
        const conn = await connect();
        const data = await conn.query("select  * from dbt_biding where status=2 and user_id=?", [req.query.user_id]);
        res.status(200).send(data[0]);
});

exports.openorderst4 =asyncMiddleware(async (req, res) => {
        console.log(req.body);
        const conn = await connect();
        const data = await conn.query("insert into dbt_biding set ?", req.body);
        res.status(200).send(data);
});




