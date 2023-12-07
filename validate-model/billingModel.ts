var Joi = require("joi");

export const createPayment = Joi.object({
  cardNumber: Joi.number().required(),
  expMonth: Joi.number().required(),
  expYear: Joi.number().required(),
  cvcNumber: Joi.string().required(),
  amount: Joi.number().required().allow("").allow(null).optional(),
  websiteId: Joi.string().required(),
  description: Joi.string().allow("").allow(null).optional(),
  email: Joi.string().allow("").allow(null).optional(),
  priceId: Joi.string().allow("").allow(null).optional(),
  languageType: Joi.string().allow("").allow(null).optional(),
  country: Joi.string().required(),
  address: Joi.string().required(),
});

export const paymentPrice = Joi.object({
  amount: Joi.number().required(),
  name: Joi.string().required(),
  description: Joi.string().allow("").allow(null).optional(),
  productId: Joi.string().allow("").allow(null).optional(),
  active: Joi.boolean().allow("").allow(null).optional(),
  metadata: Joi.object().allow("").allow(null).optional(),
});

export const updatePayment = Joi.object({
  cardNumber: Joi.number().required(),
  expMonth: Joi.number().required(),
  expYear: Joi.number().required(),
  cvcNumber: Joi.string().required(),
  websiteId: Joi.string().required(),
  description: Joi.string().allow("").allow(null).optional(),
  email: Joi.string().allow("").allow(null).optional(),
  priceId: Joi.string().allow("").allow(null).optional(),
  languageType: Joi.string().allow("").allow(null).optional(),
  country: Joi.string().required(),
  address: Joi.string().required(),
});

export const cancelPayment = Joi.object({
  websiteId: Joi.string().optional(),
  languageType: Joi.string().allow("").allow(null).optional(),
});

export const validById = Joi.object({
  productId: Joi.string().allow("").allow(null).optional(),
});

export const product = Joi.object({
  id: Joi.string().allow("").allow(null).optional(),
});

export const paymentLink = Joi.object({
  websiteId: Joi.string().required(),
  priceId: Joi.string().required(),
});

export const card = Joi.object({
  cardId: Joi.string().required(),
});

export const clientSecret = Joi.object({
  name: Joi.string().required(),
  line1: Joi.string().required(),
  line2: Joi.string().allow("").allow(null).optional(),
  websiteId: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  postalCode: Joi.string().allow("").allow(null).optional(),
  state: Joi.string().required(),
  email: Joi.string().required(),
});
