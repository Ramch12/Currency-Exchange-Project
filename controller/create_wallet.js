const connect = require('../config/Mysqlcon');
const asyncMiddleware = require('../utils/async');
const Joi = require('joi');
const axios = require('axios');

exports.create_wallet = asyncMiddleware(async (decoded, req, res) => {

    let { error, value } = Joi.object({ symbol: Joi.string().required() }).validate(req.body);
    if (error) return res.status(400).json({ status: 0, message: error.details[0].message });

    const Conn = await connect();

    let symbol = value.symbol;

    if (symbol === 'ETH' || symbol === 'BUSD' || symbol === 'MDR' || symbol === 'BNB' || symbol === 'UNI' || symbol === 'BLNS' || symbol === 'BLN' || symbol === 'DOGE' || symbol === 'SHIB') {
        const [result] = await Conn.query('select * from dbt_address where user_id=? and coin_id="ETH"', [decoded.user_id]);



        if (result.length) {
            let address = result[0].address;
            let epkey = result[0].epkey;

            console.log(decoded.user_id, symbol, address, epkey);

            let [result1] = await Conn.query('insert into dbt_address(user_id,coin_id,address,epkey) values(?)', [[decoded.user_id, symbol, address, epkey]]);
            if (result1.affectedRows)
                return res.status(201).json({ status: 1, message: "wallet created" });

        }


        else {

            try {

                let { data } = await axios.post('https://api.blockcypher.com/v1/eth/main/addrs?token=5632ae44b57b4a2dba52fd66f95a1fa');
                let address = `0x${data.address}`;
                let epkey = data.private;

                const [result3] = await Conn.query('insert into dbt_address(user_id,coin_id,address,epkey) values(?)', [[decoded.user_id, 'ETH', address, epkey]])
                const [result4] = await Conn.query('insert into dbt_address(user_id,coin_id,address,epkey) values(?)', [[decoded.user_id, symbol, address, epkey]]);

                if (result4.affectedRows)
                    return res.status(201).json({ status: 1, message: "wallet created" });

            }
            catch (err) {
                console.log(err);
                res.status(500).json({ status: 0, message: err.message });
            }

        }


    }



    else if (symbol === 'TRX' || symbol === 'USDT') {

        let [result5] = await Conn.query('select * from dbt_address where user_id=? and coin_id="TRX"', [decoded.user_id]);
        if (result5.length) {
            let address = result5[0].address
            let epkey = result5[0].epkey;

            let [result6] = await Conn.query('insert into dbt_address(user_id,coin_id,address,epkey) values(?)', [[decoded.user_id, symbol, address, epkey]]);

            if (result6.affectedRows)
                return res.status(201).json({ statuss: 1, message: "wallet create" });
        }
        else {
            //pending it will be completed in future
        }

    }




    else if (symbol === 'BTC') {
        try {

            const { data } = await axios.post('https://api.blockcypher.com/v1/btc/main/addrs?token=d45f3a36cdb34005bb7c54704de6f751');

            const  address = data.address;
            const  epkey = data.private;

            const [result8] = await Conn.query('insert into dbt_address(user_id,coin_id,address,epkey) values(?)', [[decoded.user_id, symbol, address, epkey]]);
            if (result8.affectedRows) return res.status(201).json({ status: 1, message: "wallet created" });


        }
        catch (err) {

            console.log(err);
            res.status(500).json({ status: 0, message: err.message });

        }
    }

})