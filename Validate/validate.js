const Joi = require('joi');
exports.validate = (data) => {
    const schema = Joi.object({
        first_name: Joi.string().min(3).max(30).required(),
        last_name: Joi.string().min(3).max(30).required(),
        email: Joi.string().min(3).max(30).email().required(),
        password: Joi.string().min(3).max(255).required(),
        phone: Joi.string().min(3).max(30).required()
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