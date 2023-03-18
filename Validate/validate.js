const Joi = require('joi');
exports.validate = (data) => {
    const schema = Joi.object({
        first_name: Joi.string().min(3).max(30).required(),
        last_name: Joi.string().min(3).max(30).required(),
        email: Joi.string().min(3).max(30).email().required(),
        password: Joi.string().min(3).max(255).required(),
        phone: Joi.string().min(3).max(30).required(),
        referral_id: Joi.string().min(3).max(30).required()
    });
    return schema.validate(data);
}


exports.authValidate = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(3).max(255).email().required(),
        password: Joi.string().min(3).max(255).required()
    })
    return schema.validate(data);
}


exports.validatebuy = (userdata) => {
    const schema = Joi.object({

        bid_type: Joi.string().min(3).max(3).required(),

        market_symbol: Joi.string().min(3).max(12).required(),

        bid_price: Joi.number().required(),

        bid_qty: Joi.number().required(),

        user_id: Joi.string().min(3).max(8).required()

    });
    return schema.validate(userdata)
}



exports.withdraw_validate = (data) => {
    const schema = Joi.object(
        {
            currency_symbol: Joi.string().required(),
            amount: Joi.number().required(),
            fees_amount: Joi.number().required(),
            request_Date: Joi.date().iso().required(),
            ip: Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'optional' }).required(),
            wallet_id: Joi.string().required()
        }
    )
    return schema.validate(data)

}



exports.Kyc_validation = (data) => {
    const schema = Joi.object({
        user_id: Joi.string().required(),
        verify_type: Joi.string().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        gender: Joi.number().required(),
        id_number: Joi.string().required(),
        document1: Joi.string().required(),
        document2: Joi.string().required(),
        document3: Joi.string().required(),
        address: Joi.string().required(),
    });
    return schema.validate(data);
}


exports.bank_validation = (data) => {
    const schema = Joi.object({
        user_id: Joi.string().required(),
        currency_symbol: Joi.string().required(),
        method: Joi.string().required(),
        wallet_id: Joi.object({
            acc_name: Joi.string().required(),
            acc_no: Joi.number().required(),
            branch_name: Joi.string().required(),
            ifsc_code: Joi.string().required(),
            upi: Joi.string().required(),
            type: Joi.required(),
            bank_name: Joi.string().required(),
        }).required(),
        image: Joi.string().required()
    });
    return schema.validate(data);
};



exports.validate_prof = (data) => {
    const schema = Joi.object({

        first_name: Joi.string().min(3).max(255).required(),
        last_name: Joi.string().min(3).max(255).required(),
        phone: Joi.number().required()
    });

    return schema.validate(data);

}