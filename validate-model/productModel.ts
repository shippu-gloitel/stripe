var Joi = require("joi");

export const createPoduct = Joi.object({
    id: Joi.string().allow('').allow(null).optional(),
    name: Joi.string().required(),
    active: Joi.boolean().allow('').allow(null).optional(),
    description:Joi.string().allow('').allow(null).optional(),
    metadata:Joi.object().allow('').allow(null).optional()
});