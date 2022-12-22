const express = require('express');
const router = express.Router();
const auth=require('../middleware/auth');
const createUser = require('../controller/register');
const { loginUser } = require('../controller/Login');
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


router
    .route('/create')
    .post(createUser);


router
    .route('/login')
    .post(loginUser);


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
    .route('/insertdata')
    .post(openorderst4);


module.exports = router;
