var Joi = require("joi");

export const socketConverstion = Joi.object({
  websiteId: Joi.string().required(),
});