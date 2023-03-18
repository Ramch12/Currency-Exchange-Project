
const connect=require('../config/Mysqlcon')
module.export=async(req,res,next)=>{
           
           let coin_symbol=req.body.market.split('_');
           let data=
           {
            coin_symbol:coin_symbol,
            market_symbol:req.body.market,
            rate:req.body.sellpricing,
            qty:req.body.sellamount,
            user_id:req.body.user_id
           }
           
           let currency_symbol=data.coin_symbol;
           const conn=await connect();
           let [fees]=await conn.query('select fees from dbt_fees where level="SELL" and currency_symbol=?',[currency_symbol]);
           
           if(!fees.length)
           {
             let fees_amount=(qty*fees[0].fees)/100;
             let sellfees=fees[0].fees; 
           }
           else{
            let fees_amount=0;
            let sellfees=0;
           }
 


        //    Buy Fees
        let [buyerfees]=await conn.query('select * from dbt_fees where level="BUY" and currency_symbol=?',[coin_symbol[1]]);

        if(!buyerfees.length)
        {
            let buyfees=buyerfees[0].fees;
        }
        else{
              buyfees=0;
        }

        let amount_withoutfees=data.qty;
        let amount_withfees=amount_withoutfees+fees_amount;

        let balance_c0=await conn.query("select * from dbt_balance where user_id=? and currency_symbol=?",[data.user_id,coin_symbol[0]]);
        let balance_c1=await conn.query('select * from dbt_balance where user_id=? and currency_symbol=?',[data.user_id,coin_symbol[1]]);

        
            //Pending Withdraw amoun sum

        let pending_withdraw=await conn.query("select (Sum(amount)+Sum(fees_amount) as amount,false) from dbt_withdraw where currency_symbol=? and status=2 and user_id=?",[currency_symbol[0],data.user_id]);

        //Discut user withdraw pending balance

        let real_balance=(balance_c0[0].balance-pending_withdraw[0].amount);  
        
        if(real_balance>=amount_withfees && balance_c0[0].balance>0 && amount_withfees>0)
        {
            let date=new Date();
            let open_date=date.toLocaleString();

             let exchangedata= {
                bid_type: "SELL",
                bid_price: rate,
                bid_qty: qty,
                bid_qty_available: qty,
                total_amount: rate * qty,
                amount_available: rate * qty,
                currency_symbol: coin_symbol[0],
                market_symbol: market_symbol,
                user_id: user_id,
                open_order: open_date,
                fees_amount: fees_amount,
                status: 2
              };

            //Exchange Data Insert
           let [data4]=await conn.query("insert into dbt_biding set ?",exchangedata)
            if(data4[0].insertId) 
            {
                let last_exchange=await conn.query("select * from dbt_biding where id=?",data4[0].insertId);
                     //User Balance Debit(-) C0
                let check_user_balance=await conn.query("select * from dbt_balance where user_id=? and currency_symbol=?",[data.user_id,coin_symbol[0]]);
                
                await conn.query('update table dbt_balance set balance=? where user_id=? and currency_symbol=?',[(check_user_balance[0].balance+data.total_amount+data.fees_amount),data.user_id,currency_symbol[0]]);
                
                
            }   
        }
    
    }