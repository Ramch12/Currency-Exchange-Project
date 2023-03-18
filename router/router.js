const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createUser } = require('../controller/register');
const { loginUser } = require('../controller/Login');
const { forgotPass } = require('../controller/forgotPass');
const { resetPass } = require('../controller/resetPass');
const { getsingleuser, Up_profile } = require('../controller/getsingleuser');
const { verifyOTP } = require('../controller/Login');
const { getcoin } = require('../controller/userdata');
const { getcryptocoin } = require('../controller/userdata');
const { coinhistory } = require('../controller/userdata');
const { openorder } = require('../controller/userdata');
const { openbuyorder } = require('../controller/userdata');
const { opensellorder } = require('../controller/userdata');
const { openorderst1 } = require('../controller/userdata');
const { openorderst2 } = require('../controller/userdata');
const { openorderst3 } = require('../controller/userdata');
const { openorderst4 } = require('../controller/userdata');

const { getuser_log } = require('../controller/userdata');
const { getBalance } = require('../controller/userdata');
const { getBalancelog } = require('../controller/userdata');
const { Create_KYC } = require('../controller/userdata');

const { BUY } = require('../controller/BUY');

const { verify_acc } = require('../controller/register');
const { signup_2fa } = require('../controller/google_oauth');
const { verify_2fa } = require('../controller/google_oauth');
const { disable_gauth } = require('../controller/google_oauth');
const { uploadMultiple } = require('../middleware/multer');
const { upload1 } = require('../middleware/multer');
const { bank_payout } = require('../controller/userdata');
const { Getuser_add } = require('../controller/userdata');
const { Gettrans_hist } = require('../controller/userdata');
const { createWithdraw } = require('../controller/userdata');
const { OTP_withdraw } = require('../controller/getsingleuser');
const { verify_with_OTP } = require('../controller/getsingleuser');


const { create_wallet } = require('../controller/create_wallet');

router
    .route('/create')
    .post(createUser);


router
    .route('/verify_acc/:verify_token')
    .get(verify_acc);


router
    .route('/login')
    .post(loginUser);


router
    .route('/verify_otp')
    .post(verifyOTP)

router
    .route('/forgotPass')
    .post(forgotPass);


router
    .route('/resetPass/:resettoken')
    .put(resetPass);

router
    .route('/signup_gauth')
    .post(signup_2fa);


router
    .route('/verify_gauth')
    .post(verify_2fa);


router
    .route('/disable_gauth')
    .post(auth, disable_gauth)


router
    .route('/getsingleuser')
    .get(getsingleuser)



router
    .route('/get_user_data')
    .post(auth, getuser_log);


router
    .route('/get_user_balance')
    .post(auth, getBalance);



router
    .route('/get_balance_log')
    .post(auth, getBalancelog);


router
    .route('/complete_kyc')
    .post(uploadMultiple, auth, Create_KYC);




router
    .route('/bank_payout')
    .post(upload1.single('file1'), auth, bank_payout);





router
    .route('/get_user_add')
    .post(auth, Getuser_add);



router
    .route('/get_transa_hist')
    .post(auth, Gettrans_hist);



router
    .route('/gen_with_otp')
    .post(auth, OTP_withdraw);


router
    .route('/verify_with_otp')
    .post(auth, verify_with_OTP);



router
    .route('/withdraw')
    .post(auth, createWithdraw);



router
    .route('/profile')
    .post(auth, Up_profile);



router
    .route('/create_wallet')
    .post(auth,create_wallet)













router
    .route('/markets')
    .get(getcoin);


router
    .route('/currency_symbols')
    .get(getcryptocoin);


router
    .route('/coin_history')
    .get(coinhistory);


router
    .route('/openorder')
    .get(openorder);


router
    .route('/openbuyorder')
    .get(openbuyorder);


router
    .route('/opensellorder')
    .get(opensellorder);

router
    .route('/completed_orders')
    .get(openorderst1);

router
    .route('/user_completed_order_history')
    .get(openorderst2);

router
    .route('/all_user_completed_orders')
    .get(openorderst3);


router
    .route('/all_user_completed_orders')
    .get(openorderst4);


router
    .route('/user_open_orders')
    .get(openorderst4);


router
    .route('/user_all_open_orders')
    .get(openorderst4);


router
    .route('/buy')
    .post(BUY);


module.exports = router;
