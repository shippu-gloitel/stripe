var Joi = require("joi");

export const registerWebsite = Joi.object({
  name: Joi.string().required(),
  url: Joi.string().required(),
  email: Joi.string().allow("").allow(null).optional(),
  icon: Joi.string().allow("").allow(null).optional(),
  languageType: Joi.string().allow("").allow(null).optional(),
});

export const updateWebsite = Joi.object({
  websiteId: Joi.string().required(),
  name: Joi.string().optional(),
  url: Joi.string().optional(),
  icon: Joi.string().allow("").allow(null).optional(),
});

export const WebsitesId = Joi.object({
  websiteId: Joi.string().required(),
});

export const WebsitesIdUrl = Joi.object({
  websiteId: Joi.string().required(),
  url: Joi.string().required(),
});
export const behavior = Joi.object({
  websiteId: Joi.string().required(),
  lastActive: Joi.boolean().allow(false).allow(null).optional(),
  showOpertorFace: Joi.boolean().allow(false).allow(null).optional(),
  hideChatbot: Joi.boolean().allow(false).allow(null).optional(),
  hideOnMobile: Joi.boolean().allow(false).allow(null).optional(),
  askEmail: Joi.boolean().allow(false).allow(null).optional(),
});
// chatBotColor
export const appearance = Joi.object({
  websiteId: Joi.string().required(),
  colorName: Joi.string().allow(false).allow(null).optional(),
  colorCode: Joi.string().allow(false).allow(null).optional(),
  text: Joi.string().allow(false).allow(null).optional(),
  welcomeMsg: Joi.string().allow(false).allow(null).optional(),
  background: Joi.string().allow(false).allow(null).optional(),
  backgroundImage: Joi.string().allow(false).allow(null).optional(),
  position: Joi.boolean().allow(false).allow(null).optional(),
  language: Joi.string().allow(false).allow(null).optional(),
  voiceEnable:Joi.boolean().allow(false).allow(null).optional()
});

export const checkUrl = Joi.object({
  url: Joi.string().required(),
});

export const customMsg = Joi.object({
  websiteId: Joi.string().optional(),
  question: Joi.string().optional(),
  answer: Joi.string().optional(),
  type: Joi.string().allow(false).allow(null).optional(),
});

export const customMsgId = Joi.object({
  messageId: Joi.string().required(),
});

export const updatecustomMsg = Joi.object({
  messageId: Joi.string().optional(),
  question: Joi.string().optional(),
  answer: Joi.string().optional(),
  type: Joi.string().allow(false).allow(null).optional(),
});

export const customMsgAI = Joi.object({
  question: Joi.string().required(),
  websiteId:Joi.string().required()
});

export const QACsv = Joi.object({
  websiteId:Joi.string().required()
});