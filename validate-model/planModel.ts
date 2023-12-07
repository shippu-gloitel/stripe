var Joi = require("joi");


export const addPlan = Joi.object({
    amount:Joi.number().required(),
    productId:Joi.string().required(),
    planName: Joi.string().required(),
    expiryTime:Joi.string().required()
});

export const updatePlan = Joi.object({
    planId: Joi.string().required(),
    planName:Joi.string().allow("").allow(null).optional(),
    expiryTime:Joi.string().allow("").allow(null).optional(),
});

export const validById = Joi.object({
    planId: Joi.string().required(),
});