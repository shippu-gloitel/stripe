var Joi = require("joi");

export const signUp = Joi.object({
    firstName: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    lastName: Joi.string().allow('').allow(null).optional(),
    isVerified: Joi.boolean().allow(false).allow(null).optional(),
    createdAt: Joi.string().allow('').allow(null).optional(),
    avatar: Joi.string().allow('').allow(null).optional(),
    discription: Joi.string().allow('').allow(null).optional(),
});

export const signIn = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
});

export const resetPassword = Joi.object({
    inputProperty: Joi.string().required(),
    password: Joi.string().required()
});

export const updateProfile = Joi.object({
    firstName: Joi.string().allow('').allow(null).optional(),
    lastName: Joi.string().allow('').allow(null).optional(),
    email: Joi.string().allow('').allow(null).optional(),
    password: Joi.string().allow('').allow(null).optional(),
    phoneNumber: Joi.string().allow('').allow(null).optional(),
    // countryCode:Joi.string().allow('').allow(null).optional(),
    // isVerified: Joi.boolean().allow(false).allow(null).optional(),
    // createdAt: Joi.string().allow('').allow(null).optional(),
    avatar: Joi.string().allow('').allow(null).optional(),
    description: Joi.string().allow('').allow(null).optional(),
});

export const sendOtp = Joi.object({
    countryCode:Joi.string().allow("").allow(null).optional(),
    inputProperty: Joi.string().required(),
    source: Joi.string().allow("").allow(null).optional(),
    languageType: Joi.string().allow("").allow(null).optional(),
});

export const verifyOtp = Joi.object({
    countryCode:Joi.string().allow("").allow(null).optional(),
    inputProperty: Joi.string().required(),
    otp: Joi.string().required(),
    languageType: Joi.string().allow("").allow(null).optional(),

});

export const register = Joi.object({
    name: Joi.string().allow("").allow(null).optional(),
    inputProperty: Joi.string().required(),
    password: Joi.string().required(),
});

export const login = Joi.object({
    inputProperty: Joi.string().required(),
    password: Joi.string().required(),
    // countryCode:Joi.string().allow("").allow(null).optional(),
});

export const sendOtpWithEmail = Joi.object({
    email: Joi.string().email().required(),
    source: Joi.string().allow("").allow(null).optional(),
    languageType: Joi.string().allow("").allow(null).optional(),
});

export const verifyOtpWithEmail = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
});

export const passwordWithEmail = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
});

export const resetSendOtpPassword = Joi.object({
    inputProperty: Joi.string().required(),
    countryCode:Joi.string().allow("").allow(null).optional(),
});

export const verifyForgotResetOtp = Joi.object({
    inputProperty: Joi.string().required(),
    otp: Joi.string().required(),
    countryCode:Joi.string().allow("").allow(null).optional(),
});

export const resendOtp = Joi.object({
    inputProperty: Joi.string().required(),
    countryCode:Joi.string().allow("").allow(null).optional(),
});

export const deleteUser = Joi.object({
    id: Joi.number().required(),
});

// export const fileUpload = Joi.object({
//     file: Joi.any().required(),
// });

export const newPassword = Joi.object({
    userNewPassword: Joi.required().required(),
});