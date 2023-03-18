const connect = require('../config/Mysqlcon');
const asyncMiddleware = require('../utils/async');
const { validatebuy } = require('../Validate/validate');

exports.BUY = asyncMiddleware(async (req, res, next) => {
    const data =
    {
        bid_type: req.body.bid_type,
        bid_qty: req.body.bid_qty,
        bid_price: req.body.bid_price,
        market_symbol: req.body.market_symbol,
        user_id: req.body.user_id
    }
    const conn = await connect();

    const { error } = validatebuy(data);
    if (error) return res.status(400).json({ status: 0, message: error.details[0].message });

    let currency_symbol = data.market_symbol.split("_")[0];
    const [data1] = await conn.query("select fees from dbt_fees where level=? and currency_symbol=?", [data.bid_type, currency_symbol]);

    let Per_value;
    if (data1.length != 0) {
        Per_value = ((data.bid_price * data.bid_qty * data1[0].fees) / 100);
    }

    const [Balance] = await conn.query("select balance from dbt_balance where user_id=? and currency_symbol=?", [data.user_id, currency_symbol]);

    const total_amount = ((data.bid_qty * data.bid_price) + Per_value);

    if (Balance[0].balance > total_amount) {
        const data2 = {
            bid_type: 'BUY',
            bid_price: data.bid_price,
            bid_qty: data.bid_qty,
            bid_qty_available: data.bid_qty,
            total_amount: total_amount,
            amount_available: total_amount,
            currency_symbol: currency_symbol,
            market_symbol: data.market_symbol,
            user_id: data.user_id,
            fees_amount: Per_value,
            status: 2
        }

        const [userrec] = await conn.query("insert into dbt_biding set ?", data2);

        let new_balance = (Balance[0].balance - total_amount);
        
        const [data3] = await conn.query("update dbt_balance set balance=? where user_id=? and currency_symbol=?", [new_balance, data.user_id, currency_symbol]);


        const [last_exchange] = await conn.query('select * from dbt_biding where id=?', [userrec[0].insertId]);

        const [sellexchange] = await conn.query("select * from dbt_biding where bid_price<=? and status=2 and bid_type='SELL' and market_symbol=? order by open_order asc", [last_exchange[0].bid_price, last_exchange[0].market_symbol]);

        if (sellexchange.length != 0) {
            for (i in sellexchange) {
                let seller_available_qty = 0;
                let buyer_available_qty = 0;
                let buyer_amount_available = 0;
                let seller_amount_available = 0;
                let seller_complete_qty_log = 0;
                let buyer_complete_qty_log = 0;
                let buyer_amount_available_log = 0;
                let seller_amount_available_log = 0;
                //
                if (last_exchange[0].status === 2) {
                    if (sellexchange[0].bid_qty_available - last_exchange[0].bid_qty_available < 0) {
                        seller_available_qty = 0;
                    }
                    else {
                        seller_available_qty = sellexchange[0].bid_qty_available - last_exchange[0].bid_qty_available
                    }

                    buyer_available_qty = ((last_exchange[0].bid_qty_available - sellexchange[0].bid_qty_available) <= 0) ? 0 : (last_exchange[0].bid_qty_available - sellexchange[0].bid_qty_available);
                    buyer_amount_available = (last_exchange[0].amount_available - (sellexchange[0].bid_qty_available * sellexchange[0].bid_price) <= 0) ? 0 : (last_exchange[0].amount_available - (sellexchange[0].bid_qty_available * sellexchange[0].bid_price));
                    seller_amount_available = (((sellexchange[0].bid_qty_available - last_exchange[0].bid_qty_available) < 0) ? 0 : sellexchange[0].bid_qty_available - last_exchange[0].bid_qty_available) * sellexchange[0].bid_price;
                    

                    if (sellexchange[0].bid_qty_available - last_exchange[0].bid_qty_available === 0) {
                        buyer_complete_qty_log = last_exchange[0].bid_qty_available
                    } else if (sellexchange[0].bid_qty_available - last_exchange[0].bid_qty_available <= 0) {
                        buyer_complete_qty_log = sellexchange[0].bid_qty_available;
                    }
                    else {
                        buyer_complete_qty_log = last_exchange[0].bid_qty_available
                    }

                    buyer_amount_available_log = (last_exchange[0].amount_available - (last_exchange[0].bid_qty_available * sellexchange[0].bid_price) <= 0) ? 0 : (last_exchange[0].amount_available - (last_exchange[0].bid_qty_available * sellexchange[0].bid_price));

                    if (sellexchange[0].bid_qty_available - last_exchange[0].bid_qty_available == 0) {
                        seller_complete_qty_log = last_exchange[0].bid_qty_available;
                    } else if (sellexchange[0].bid_qty_available - last_exchange[0].bid_qty_available < 0) {
                        seller_complete_qty_log = sellexchange[0].bid_qty_available;
                    }
                    else {
                        seller_complete_qty_log = last_exchange[0].bid_qty_available;
                    }

                    let exchangebuydata = new Array(
                        bid_qty_available = buyer_available_qty,
                        amount_available = buyer_amount_available,
                        status = ((last_exchange[0].bid_qty_available - sellexchange[0].bid_qty_available) <= 0) ? 1 : 2
                    );

                    let exchangeselldata = new Array
                        (
                            bid_qty_available = seller_available_qty,
                            amount_available = seller_amount_available,
                            status = ((sellexchange[0].bid_qty_available - last_exchange[0].bid_qty_available) <= 0) ? 1 : 2
                        );

                    await conn.query('update dbt_biding set bid_qty_available=? ,amount_available=? ,status=? where id=?', exchangebuydata);
                    await conn.query('update dbt_biding set bid_qty_available=? ,amount_available=? ,status=? where id=?', exchangeselldata);

                    if (last_exchange[0].bid_price > sellexchange[0].bid_price) {
                        let totalexchanceqty = buyer_complete_qty_log;

                        let buyremeaningrate = last_exchange[0].bid_price - sellexchange[0].bid_price;
                        let buyerbalence = totalexchanceqty * buyremeaningrate;

                        let returnfees = 0;
                        let byerfees = (totalexchanceqty * last_exchange[0].bid_price * buyfees) / 100;
                        let sellerrfees = (totalexchanceqty * sellexchange[0].bid_price * sellfees) / 100;
                        let buyerreturnfees = byerfees - sellerrfees;

                        if (buyerreturnfees > 0) {
                            returnfees = buyerreturnfees;
                        }

                        let buyeruserid = last_exchange[0].user_id;

                        let balance_data = new Array(
                            user_id = buyeruserid,
                            amount = buyerbalence,
                            return_fees = returnfees,
                            currency_symbol = currency_symbol,
                            ip = this.input.ip_address()
                        );

                        await conn.query("insert into dbt_biding ")
                    }

                    let buytraderlog = {
                        bid_id: last_exchange[0].id,
                        bid_type: last_exchange[0].bid_type,
                        complete_qty: buyer_complete_qty_log,
                        bid_price: sellexchange[0].bid_price,
                        complete_amount: buyer_complete_qty_log * sellexchange[0].bid_price,
                        user_id: last_exchange[0].user_id,
                        currency_symbol: last_exchange[0].currency_symbol,
                        market_symbol: last_exchange[0].market_symbol,
                        success_time: open_date,
                        fees_amount: last_exchange[0].fees_amount,
                        available_amount: buyer_amount_available_log,
                        status: (last_exchange[0].amount_available - (last_exchange[0].bid_qty_available * sellexchange[0].bid_price) <= 0) ? 1 : 2
                    }

                    let selltraderlog = {
                        bid_id: sellexchange[0].id,
                        bid_type: sellexchange[0].bid_type,
                        complete_qty: seller_complete_qty_log,
                        bid_price: sellexchange[0].bid_price,
                        complete_amount: seller_complete_qty_log * sellexchange[0].bid_price,
                        user_id: sellexchange[0].user_id,
                        currency_symbol: sellexchange[0].currency_symbol,
                        market_symbol: sellexchange[0].market_symbol,
                        success_time: open_date,
                        fees_amount: sellexchange[0].fees_amount,
                        available_amount: sellexchange[0].bid_qty_available * sellexchange[0].bid_price,
                        status: (sellexchange[0].amount_available - (sellexchange[0].bid_qty_available * sellexchange[0].bid_price) <= 0) ? 1 : 2
                    };

                    await conn.query('insert into dbt_biding set ?', selltraderlog);
                    await conn.query('insert into dbt_biding set ?', buytraderlog);


                    await conn.query("select * from dbt_balance where user_id=? and currency_symbol=?", [last_exchange[0].user_id, last_exchange[0].currency_symbol]);
                 
                    if (!buyer_balance) {
                        let user_balance = {
                            user_id: last_exchange[0].user_id,
                            currency_symbol: currency_symbol,
                            balance: buyer_complete_qty_log,
                            last_update: open_date
                        }
                        conn.query('insert into dbt_balances set ?', user_balance);
                    }
                    else {
                        conn.query('update dbt_balance set balance=? where user_id=? and currency_symbol=?', [(buyer_balance[0].balance + buyer_complete_qty_log), last_exchange[0].user_id, currency_symbol])
                    }

                 
                    let check_seller_balance = await conn.query('select * from dbt_balance where user_id=? and currency_symbol=? ', [sellexchange[0].user_id, currency_symbol]);
                    if (!check_seller_balance.length) {
                        let user_balance = {
                            user_id: sellexchange[0].user_id,
                            currency_symbol: currency_symbol,
                            balance: buyer_complete_qty_log * sellexchange[0].bid_price,
                            last_update: open_date
                        };

                        await conn.query('insert into dbt_balance set ?',user_balance);

                    }
                    else
                    {
                        await conn.query('update dbt_balance set balance=? where user_id=? and currency_symbol=?',[(check_seller_balance[0].balance+(buyer_complete_qty_log*sellexchange[0].bid_price)),sellexchange[0].user_id,currency_symbol]);
                    }     
                }
            }

        }
    }
    else {
        res.status(400).json({ status: 0, message: "You can't trade due to insufficient balance" })
    }


})
