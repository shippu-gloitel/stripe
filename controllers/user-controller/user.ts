import {
  comparePassword,
  generateBcryptPassword,
} from "../../services/becrypt.service";
import {
  generateJwtToken,
  verifyJwtToken,
  verifyUserJwtToken,
} from "../../services/user-services/auth.service";
import {
  createUser,
  deleteUser,
  findUserIsExist,
  getRegisteredUserWithEmail,
  getRegisteredUserWithPhone,
  getUser,
  getUserByEmail,
  // getUserByPhone,
  getVerifedRegisteredUserWithEmail,
  getVerifedRegisteredUserWithPhone,
  updateProfile,
  updateUserPassword,
  updateWithEmailProfile,
  updateWithPhoneProfile,
} from "../../services/user-services/user.service";
import {
  EMAIL_VALIDATION,
  ERROR_OCCURS,
  FIND_DATA,
  INVALID_PASSWORD,
  INVALID_TOKEN,
  NOT_EXISTS,
  PASSWORD_UPDATED,
  SERVER_ERROR,
  UNAUTHORIZED,
  UPDATE_PROFILE,
  USER_LOGIN,
  REGISTERED_PHONE,
  OTP_PHONE,
  VERIFY_PHONE,
  VERIFY_USER,
  OTP_VALIDATION,
  NOT_VERIFYED,
  REGISTERED_EMAIL,
  OTP_SEND_EMAIL,
  COUNTRY_CODE,
  REGISTERED_EMAIL_NOT,
  VALID_EMAIL,
  ADDED_USER,
  VALID_PHONE,
  MATCHED_OTP,
  USER_DELETED,
  JWT_EXPRIED,
  VAL_PRO,
  // VALID_CODE,
  ENTRY_EMAIL,
  PASSOWRD_EXIST,
  PASSOWRD_NOT_EXIST,
  // NAME_VALIDATION,
} from "../../utils/constants";
import { config } from "../../config";
import { sendOtpWithTwilio, verifyOtpWithTwilio } from "../../utils/twilio";
import {
  isEmail,
  //  isName,
  isPhone,
} from "../../helper/validator";

const twilioClient = require("twilio")(
  config.twillioAccountSid,
  config.twillioAuthToken,
  {
    lazyLoading: true,
  }
);

/**
 * @api {post} /user/send-otp   Send Otp to user
 * @apiName Send Otp
 * @apiGroup User
 * @apiParam {String} countryCode countryCode of User
 * @apiParam {String} inputProperty Email/Phone of User `Mendatory`
 * @apiParam {String} source  source of User
 * @apiParam {String} languageType languageType of User
 * @apiDescription  User Service..
 */
export const sendOtp = async (req: any, reply: any) => {
  let setLanugageKey: any = "";
  if (req.body.languageType === "ja") {
    setLanugageKey = config.authServiceSidJp;
  } else {
    setLanugageKey = config.authServiceSidEn;
  }
  if (isEmail(req.body.inputProperty?.toLowerCase())) {
    await sendOtpForEmail(req, reply, setLanugageKey);
  } else if (isPhone(req.body.inputProperty)) {
    await sendOtpForPhone(req, reply, setLanugageKey);
  } else {
    return reply.code(400).send({
      success: false,
      data: null,
      msg: VAL_PRO,
    });
  }
};

/**
 * @api {post} /user/otp-verify   Verify OTP For Phone/Email
 * @apiName Verify OTP Of User For Phone/Email
 * @apiGroup User
 * @apiParam {String} countryCode countryCode of User
 * @apiParam {String} inputProperty Email/Phone of User `Mendatory`
 * @apiParam {String} otp  otp of User
 * @apiParam {String} languageType languageType of User
 * @apiDescription  User Service..
 */
export const verifyOtp = async (req: any, reply: any) => {
  let setLanugageKey: any = "";
  if (req.body.languageType === "ja") {
    setLanugageKey = config.authServiceSidJp;
  } else {
    setLanugageKey = config.authServiceSidEn;
  }
  if (req.body.inputProperty?.toLowerCase().includes("@")) {
    await verifyOtpForEmail(req, reply, setLanugageKey);
  } else {
    await verifyOtpForPhone(req, reply, setLanugageKey);
  }
};

/**
 * @api {post} /users/sign-up   Register to user
 * @apiName Sign-up User
 * @apiGroup User
 * @apiParam {String} name  name of User
 * @apiParam {String} inputProperty   Email/Phone of User `Mendatory`
 * @apiParam {String} password  password  of User `Mendatory`
 * @apiDescription  User Service..
 */
export const registerUser = async (req: any, reply: any) => {
  if (req.body.inputProperty?.toLowerCase().includes("@")) {
    await registerWithEmail(req, reply);
  } else {
    await registerWithPhone(req, reply);
  }
};

/**
 * @api {post} /users/login   login user
 * @apiName login user
 * @apiGroup User
 * @apiParam {String} inputProperty   Email/Phone of User `Mendatory`
 * @apiParam {String} password  password  of User `Mendatory`
 * @apiDescription  User Service..
 */
export const loginUser = async (req: any, reply: any) => {
  if (req.body.inputProperty?.toLowerCase().includes("@")) {
    await loginWithEmail(req, reply, "email");
  } else {
    //  ************* check number is valid or not ***********
    const str = req.body.inputProperty;
    // let cc = str.split(str.slice(-10))[0];
    var checkNumber = str.replace(/\D/g, "").slice(-10);
    req.body["isValidNumber"] = checkNumber;
    let isExist = await getRegisteredUserWithPhone(checkNumber);
    if (!isExist) {
      var isPhoneNumber = str.replace(/\D/g, "").slice(-9);
      req.body["isValidNumber"] = isPhoneNumber;
      isExist = await getRegisteredUserWithPhone(isPhoneNumber);
    }
    if (isExist) {
      await loginWithPhone(req, reply, "phone");
    } else {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: VERIFY_PHONE,
      });
    }
  }
};

export const sendOtpForEmail = async (
  req: any,
  reply: any,
  lanugageKey: string
) => {
  try {
    let findUserResponse = await getRegisteredUserWithEmail(
      req.body.inputProperty
    );
    if (
      findUserResponse &&
      findUserResponse.isVerified &&
      findUserResponse.isRegister
    ) {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: REGISTERED_EMAIL,
      });
    } else {
      let email = req.body.inputProperty?.toLowerCase();
      twilioClient.verify
        .services(lanugageKey)
        .verifications.create({ to: email, channel: "email" })
        .then(async (verification: any) => {
          console.log(verification);
          if (!findUserResponse) {
            let createPayload: any = { email: email };
            if (req.body.source && req.body.source == "tcg")
              createPayload["userInfo"] = 3;
            const isExist = await findUserIsExist(email);
            if (!isExist) {
              await createUser(createPayload);
            }
          }
          return reply.code(200).send({
            success: true,
            data: null,
            msg: OTP_SEND_EMAIL,
          });
        })
        .catch((err: any) => {
          console.log(err, "----169");

          if (err.message && err.message.startsWith("Invalid parameter `To`")) {
            return reply
              .code(400)
              .send({ success: false, data: err, msg: VALID_EMAIL });
          } else {
            return reply
              .code(400)
              .send({ success: false, data: err, msg: ERROR_OCCURS });
          }
        });
    }
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

export const verifyOtpForEmail = async (
  req: any,
  reply: any,
  lanugageKey: string
) => {
  try {
    let findUserResponse = await getRegisteredUserWithEmail(
      req.body.inputProperty?.toLowerCase()
    );
    console.log(findUserResponse, "--");

    if (
      findUserResponse &&
      findUserResponse.isVerified &&
      findUserResponse.isRegister
    ) {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: REGISTERED_EMAIL,
      });
    } else {
      twilioClient.verify
        .services(lanugageKey)
        .verificationChecks.create({
          to: req.body.inputProperty?.toLowerCase(),
          code: req.body.otp,
        })
        .then(async (verification_check: any) => {
          console.log(verification_check, "--verification_check");

          if (verification_check.status == "approved") {
            console.log(req.body, "--req.body");

            await updateWithEmailProfile(
              { email: req.body.inputProperty?.toLowerCase() },
              { isVerified: true }
            );
            return reply
              .code(200)
              .send({ success: true, data: null, msg: "User is verified" });
          } else {
            return reply
              .code(400)
              .send({ success: false, data: null, msg: "Otp is incorrect" });
          }
        })
        .catch((err: any) => {
          console.log(err, "--err 235");

          if (err.message && err.message.startsWith("Invalid parameter `To`")) {
            return reply
              .code(400)
              .send({ success: false, data: null, msg: VALID_EMAIL });
          } else {
            return reply
              .code(400)
              .send({ success: false, data: null, msg: ERROR_OCCURS });
          }
        });
    }
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, data: error, msg: "Internal server error" });
  }
};

export const registerWithEmail = async (req: any, reply: any) => {
  try {
    let findUserResponse = await getVerifedRegisteredUserWithEmail(
      req.body.inputProperty?.toLowerCase()
    );
    console.log(findUserResponse, "--");

    if (!findUserResponse) {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: NOT_VERIFYED,
      });
    } else if (findUserResponse && findUserResponse.isVerified) {
      if (findUserResponse.password !== null) {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: "User password already created",
        });
      } else {
        let firstName = "";
        let lastName = "";
        if (req.body.name) {
          if (req.body.name) {
            let data = req.body.name.split(" ");
            firstName = data[0];
            lastName = data[1];
          } else {
            firstName = req.body.name;
          }
        }
        // else {
        //   return reply.code(400).send({
        //     success: false,
        //     data: null,
        //     msg: NAME_VALIDATION,
        //   });
        // }
        let password = generateBcryptPassword(req.body.password);
        await updateProfile(
          { id: findUserResponse.id },
          {
            firstName: firstName,
            lastName: lastName,
            password: password,
            isRegister: true,
            registerType: "email",
          }
        );
        const token = generateJwtToken({
          id: findUserResponse.id,
          inputProperty: findUserResponse.email?.toLowerCase(),
        });
        const userData = await getUser(findUserResponse.id);
        let user = {
          id: userData.id,
          firstName: `${userData.firstName}`,
          lastName: userData.lastName ? userData.lastName : "",
          email: userData.email ? userData.email : "",
          phoneNumber: userData.phoneNumber ? userData.phoneNumber : "",
          countryCode: findUserResponse.countryCode ? findUserResponse.phoneNumber : "",
        };
        return reply.code(200).send({
          success: true,
          data: { token, user },
          msg: ADDED_USER,
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: NOT_VERIFYED,
      });
    }
  } catch (error) {
    console.log(error, "--");

    return reply
      .code(500)
      .send({ success: false, data: error, msg: SERVER_ERROR });
  }
};

/**
 * @api {post} /users/login   login user
 * @apiName login user
 * @apiGroup User
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  User Service..
 */
export const loginWithEmail = async (
  req: any,
  reply: any,
  entryType: string
) => {
  try {
    let userDetails = await getRegisteredUserWithEmail(
      req.body.inputProperty?.toLowerCase()
    );
    console.log(userDetails, "--userDetails");
    if (userDetails) {
      if (userDetails && userDetails.registerType != entryType) {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: ENTRY_EMAIL,
        });
      } else {
        const checkPassword = await comparePassword(
          req.body.password,
          userDetails.password
        );
        if (checkPassword) {
          const token = generateJwtToken({
            id: userDetails.id,
            email: userDetails.email?.toLowerCase(),
            inputProperty: userDetails.email?.toLowerCase(),
          });
          if (userDetails.password) {
            delete userDetails.password;
          }
          userDetails["token"] = token;
          return reply.code(200).send({
            success: true,
            data: userDetails,
            msg: USER_LOGIN,
          });
        } else {
          return reply.code(400).send({
            success: false,
            data: null,
            msg: INVALID_PASSWORD,
          });
        }
      }
    } else
      return reply.code(400).send({
        success: false,
        data: null,
        msg: EMAIL_VALIDATION,
      });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

const sendOtpForPhone = async (req: any, reply: any, lanugageKey: string) => {
  try {
    if (req.body.countryCode) {
      let findUserResponse = await getRegisteredUserWithPhone(
        req.body.inputProperty
      );
      if (
        findUserResponse &&
        findUserResponse.isVerified &&
        findUserResponse.isRegister
      ) {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: REGISTERED_PHONE,
        });
      } else {
        // `+${req.body.contryCode}${req.body.phoneNumber}`
        const verification = await twilioClient.verify
          .services(lanugageKey)
          .verifications.create({
            to: `+${req.body.countryCode}${req.body.inputProperty}`,
            channel: "sms", // sms, call, or email
          });
        console.log(verification);
        if (!findUserResponse) {
          let createPayload: any = {
            phoneNumber: req.body.inputProperty,
            countryCode: req.body.countryCode,
          };
          if (req.body.source && req.body.source == "tcg")
            createPayload["userInfo"] = 3;
          const isExist = await findUserIsExist(req.body.inputProperty);
          if (!isExist) {
            await createUser(createPayload);
          }
        }
        return reply.code(200).send({
          success: true,
          data: null,
          msg: OTP_PHONE,
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: COUNTRY_CODE,
      });
    }
  } catch (error) {
    console.log(error, "--error");

    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

const verifyOtpForPhone = async (req: any, reply: any, lanugageKey: string) => {
  try {
    if (req.body.countryCode) {
      let findUserResponse = await getRegisteredUserWithPhone(
        req.body.inputProperty
      );
      if (findUserResponse) {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: VERIFY_PHONE,
        });
      } else {
        const verification_check = await twilioClient.verify
          .services(lanugageKey)
          .verificationChecks.create({
            to: `+${req.body.countryCode}${req.body.inputProperty}`,
            code: req.body.otp,
          });
        console.log(verification_check, "--verification_check");

        if (verification_check.status == "approved") {
          await updateWithPhoneProfile(
            { phoneNumber: req.body.inputProperty },
            { isVerified: true }
          );
          return reply.code(200).send({
            success: true,
            data: null,
            msg: VERIFY_USER,
          });
        } else {
          return reply.code(400).send({
            success: false,
            data: null,
            msg: OTP_VALIDATION,
          });
        }
      }
    } else {
      return reply.code(500).send({
        success: false,
        data: null,
        msg: COUNTRY_CODE,
      });
    }
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

export const registerWithPhone = async (req: any, reply: any) => {
  try {
    let findUserResponse = await getVerifedRegisteredUserWithPhone(
      req.body.inputProperty
    );
    if (!findUserResponse) {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: NOT_VERIFYED,
      });
    } else if (findUserResponse && findUserResponse.isVerified) {
      if (findUserResponse.password !== null) {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: "User password already created",
        });
      } else {
        let firstName = "";
        let lastName = "";
        if (req.body.name) {
          if (req.body.name) {
            let data = req.body.name.split(" ");
            firstName = data[0];
            lastName = data[1];
          } else {
            firstName = req.body.name;
          }
        }

        let password = generateBcryptPassword(req.body.password);
        const userData = {
          firstName: firstName,
          lastName: lastName,
          password: password,
          isRegister: true,
          registerType: "phone",
        };
        await updateWithPhoneProfile(
          { phoneNumber: req.body.inputProperty },
          userData
        );
        const token = generateJwtToken({
          id: findUserResponse.id,
          inputProperty: findUserResponse.phoneNumber,
        });
        const userRes = await getUser(findUserResponse.id);
        let user = {
          id: userRes.id,
          firstName: `${userRes.firstName}`,
          lastName: userRes.lastName ? userRes.lastName : "",
          email: userRes.email ? userRes.email : "",
          phoneNumber: userRes.phoneNumber ? userRes.phoneNumber : "",
          countryCode: findUserResponse.countryCode ? findUserResponse.countryCode : "",
        };
        // let user = {
        //   id: findUserResponse.id,
        //   name: `${firstName} ${lastName}`,
        //   email: findUserResponse.email ? findUserResponse.email : "",
        //   phoneNumber: findUserResponse.phoneNumber
        //     ? findUserResponse.phoneNumber
        //     : "",
        // };
        return reply.code(200).send({
          success: true,
          data: { token, user },
          msg: ADDED_USER,
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: NOT_VERIFYED,
      });
    }
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

export const loginWithPhone = async (
  req: any,
  reply: any,
  entryType: string
) => {
  console.log(req.body.isValidNumber, "---req.body.isValidNumber");

  try {
    let userDetails = await getRegisteredUserWithPhone(req.body.isValidNumber);
    console.log(userDetails, "---userDetails", req.body.password);

    if (userDetails) {
      if (userDetails && userDetails.registerType != entryType) {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: ENTRY_EMAIL,
        });
      } else {
        const checkPassword = await comparePassword(
          req.body.password,
          userDetails.password
        );
        console.log(checkPassword, "---checkPassword");

        if (checkPassword) {
          const token = generateJwtToken({
            id: userDetails.id,
            email: userDetails.email?.toLowerCase(),
            inputProperty: userDetails.phoneNumber,
          });
          if (userDetails.password) {
            delete userDetails.password;
          }
          userDetails["token"] = token;
          return reply.code(200).send({
            success: true,
            data: userDetails,
            msg: USER_LOGIN,
          });
        } else {
          return reply.code(200).send({
            success: false,
            data: null,
            msg: INVALID_PASSWORD,
          });
        }
      }
    } else
      return reply.code(400).send({
        success: false,
        data: null,
        msg: EMAIL_VALIDATION,
      });
  } catch (error) {
    console.log(error, "--error");

    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /user/resend-otp  Resend OTP
 * @apiName Resend OTP
 * @apiGroup User
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  User Service..
 */
export const resendOtp = async (req: any, reply: any) => {
  await sendOtp(req, reply);
};

/**
 * @api {post} /user/reset-password  Reset Password
 * @apiName Reset Password
 * @apiGroup User
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  User Service..
 */
export const resetPassword1 = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      verifyJwtToken(token, async function (error: any, decoded: any) {
        if (error) {
          return reply.code(403).send({
            success: false,
            data: error,
            msg: INVALID_TOKEN,
          });
        } else {
          if (decoded.email) {
            let emailAddress = decoded.email;
            if (decoded.email) {
              let userResponse = await getUserByEmail(emailAddress);
              if (!userResponse) {
                return reply.code(400).send({
                  success: false,
                  data: null,
                  msg: NOT_EXISTS,
                });
              } else if (userResponse && userResponse.isVerified) {
                let password = generateBcryptPassword(req.body.password);
                await updateUserPassword(userResponse.id, {
                  password: password,
                  isVerified: true,
                });
                return reply.code(200).send({
                  success: true,
                  data: null,
                  msg: PASSWORD_UPDATED,
                });
              } else {
                return reply.code(400).send({
                  success: true,
                  data: null,
                  msg: ERROR_OCCURS,
                });
              }
            } else {
              return reply.code(500).send({
                success: false,
                data: error,
                msg: SERVER_ERROR,
              });
            }
          } else {
            return reply.code(403).send({
              success: false,
              data: null,
              msg: INVALID_TOKEN,
            });
          }
        }
      });
    } else {
      return reply.code(401).send({
        success: false,
        data: null,
        msg: UNAUTHORIZED,
      });
    }
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /users/update-profile   Update profile
 * @apiName  Update profile
 * @apiGroup User
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String} firstName
 * @apiParam {String} lastName
 * @apiParam {String} email
 * @apiParam {String} password
 * @apiParam {String} phoneNumber
 * @apiParam {String} avatar
 * @apiParam {String} discription
 * @apiDescription  User Service..
 */
export const updateUserProfile = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      verifyJwtToken(token, async function (error: any, decoded: any) {
        if (error && error.message.includes("jwt expired")) {
          return reply.code(401).send({
            success: false,
            data: error,
            msg: JWT_EXPRIED,
          });
        } else if (error && error.message.includes("invalid signature")) {
          return reply.code(403).send({
            success: false,
            data: error,
            msg: INVALID_TOKEN,
          });
        } else {
          if (decoded.inputProperty) {
            let userResponse: any = {};
            if (decoded.inputProperty) {
              if (decoded.inputProperty?.toLowerCase().includes("@")) {
                userResponse = await getRegisteredUserWithEmail(
                  decoded.inputProperty?.toLowerCase()
                );
              } else {
                userResponse = await getRegisteredUserWithPhone(
                  decoded.inputProperty
                );
              }
              if (!userResponse) {
                return reply.code(400).send({
                  success: false,
                  data: null,
                  msg: NOT_EXISTS,
                });
              } else if (userResponse && userResponse.isVerified) {
                if (req.body.password) {
                  let password = generateBcryptPassword(req.body.password);
                  req.body["password"] = password;
                } else if (req.body.password == "") {
                  delete req.body.password;
                }
                let updatedData = await updateProfile(
                  { id: userResponse.id },
                  req.body
                );
                if (updatedData) {
                  let updatedUser: any = {};
                  if (decoded.inputProperty.includes("@")) {
                    updatedUser = await getRegisteredUserWithEmail(
                      decoded.inputProperty
                    );
                  } else {
                    updatedUser = await getRegisteredUserWithPhone(
                      decoded.inputProperty
                    );
                  }
                  if (updatedUser.password) {
                    delete updatedUser.password;
                  }

                  return reply.code(200).send({
                    success: true,
                    data: updatedUser,
                    msg: UPDATE_PROFILE,
                  });
                } else {
                  return reply.code(400).send({
                    success: true,
                    data: null,
                    msg: ERROR_OCCURS,
                  });
                }
              } else {
                return reply.code(400).send({
                  success: false,
                  data: null,
                  msg: ERROR_OCCURS,
                });
              }
            } else {
              return reply.code(500).send({
                success: false,
                data: error,
                msg: SERVER_ERROR,
              });
            }
          } else {
            return reply.code(403).send({
              success: false,
              data: null,
              msg: INVALID_TOKEN,
            });
          }
        }
      });
    } else {
      return reply.code(401).send({
        success: false,
        data: null,
        msg: UNAUTHORIZED,
      });
    }
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {get} /users/get-user  Get User
 * @apiName Get User
 * @apiGroup User
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  User Service..
 */
export const getUserById = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      verifyJwtToken(token, async function (error: any, decoded: any) {
        if (error && error.message.includes("jwt expired")) {
          return reply.code(401).send({
            success: false,
            data: error,
            msg: JWT_EXPRIED,
          });
        } else if (error && error.message.includes("invalid signature")) {
          return reply.code(403).send({
            success: false,
            data: error,
            msg: INVALID_TOKEN,
          });
        } else {
          let userId = decoded.id;
          if (decoded.inputProperty) {
            let userResponse = await getUser(userId);
            console.log(userResponse, "--userResponse");

            if (!userResponse) {
              return reply.code(400).send({
                success: false,
                data: null,
                msg: NOT_EXISTS,
              });
            } else if (userResponse && userResponse.isVerified) {
              return reply.code(200).send({
                success: true,
                data: userResponse,
                msg: FIND_DATA,
              });
            } else {
              return reply.code(400).send({
                success: true,
                data: null,
                msg: ERROR_OCCURS,
              });
            }
          } else {
            return reply.code(500).send({
              success: false,
              data: error,
              msg: SERVER_ERROR,
            });
          }
        }
      });
    } else {
      return reply.code(401).send({
        success: false,
        data: null,
        msg: UNAUTHORIZED,
      });
    }
  } catch (error) {
    console.log(error, "--error");

    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

export const sendOtpForgotPassword = async (req: any, reply: any) => {
  try {
    if (req.body.inputProperty?.toLowerCase().includes("@")) {
      const findUserByEmail = await getRegisteredUserWithEmail(
        req.body.inputProperty?.toLowerCase()
      );
      if (!findUserByEmail) {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: REGISTERED_EMAIL_NOT,
        });
      } else if (findUserByEmail && findUserByEmail.isRegister) {
        const verification: any = await sendOtpWithTwilio(req.body, "email");
        console.log(verification, "----941");

        if (verification.sid) {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: OTP_SEND_EMAIL,
          });
        } else {
          return reply.code(400).send({
            success: false,
            data: null,
            msg: VALID_EMAIL,
          });
        }
      } else {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: REGISTERED_EMAIL_NOT,
        });
      }
    } else {
      if (req.body.countryCode) {
        const findUserByemail = await getRegisteredUserWithPhone(
          req.body.inputProperty
        );
        if (!findUserByemail) {
          return reply.code(400).send({
            success: false,
            data: null,
            msg: VERIFY_PHONE,
          });
        } else if (findUserByemail && findUserByemail.isRegister) {
          // req.body["countryCode"]=findUserByemail.countryCode
          const verification: any = await sendOtpWithTwilio(req.body, "phone");
          console.log(verification, "--verification");

          if (verification.sid) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: OTP_PHONE,
            });
          } else {
            return reply.code(400).send({
              success: false,
              data: null,
              msg: VALID_PHONE,
            });
          }
        } else {
          return reply.code(400).send({
            success: false,
            data: null,
            msg: VERIFY_PHONE,
          });
        }
      } else {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: COUNTRY_CODE,
        });
      }
    }
  } catch (error) {
    console.log(error, "---error");

    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};
export const verifyOtpForgotPassword = async (req: any, reply: any) => {
  try {
    if (req.body.inputProperty?.toLowerCase().includes("@")) {
      const findUserByEmail = await getRegisteredUserWithEmail(
        req.body.inputProperty?.toLowerCase()
      );
      if (!findUserByEmail) {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: REGISTERED_EMAIL_NOT,
        });
      } else if (findUserByEmail && findUserByEmail.isRegister) {
        console.log(findUserByEmail, "--findUserByEmail");

        const verification_check: any = await verifyOtpWithTwilio(
          req.body,
          "email"
        );
        console.log(verification_check, "---verification_check");
        if (verification_check && verification_check.status == "approved") {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: MATCHED_OTP,
          });
        } else {
          return reply.code(400).send({
            success: false,
            data: null,
            msg: OTP_VALIDATION,
          });
        }
      } else {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: REGISTERED_EMAIL_NOT,
        });
      }
    } else if (req.body.countryCode) {
      const findUserByPhone = await getRegisteredUserWithPhone(
        req.body.inputProperty
      );
      if (!findUserByPhone) {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: VERIFY_PHONE,
        });
      } else if (findUserByPhone && findUserByPhone.isRegister) {
        const verification_check: any = await verifyOtpWithTwilio(
          req.body,
          "phone"
        );
        console.log(verification_check, "---verification_check");
        if (verification_check && verification_check.status == "approved") {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: MATCHED_OTP,
          });
        } else {
          return reply.code(400).send({
            success: false,
            data: null,
            msg: OTP_VALIDATION,
          });
        }
      } else {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: VERIFY_PHONE,
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: COUNTRY_CODE,
      });
    }
  } catch (error) {
    console.log(error, "---1082");

    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

export const resetPassword = async (req: any, reply: any) => {
  // const varifyAuthToken = await verifyUserJwtToken(token);
  if (req.body.inputProperty.includes("@")) {
    const getUserByEmail = await getRegisteredUserWithEmail(
      req.body.inputProperty?.toLowerCase()
    );
    if (!getUserByEmail) {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: REGISTERED_EMAIL_NOT,
      });
    } else {
      let password = generateBcryptPassword(req.body.password);
      await updateUserPassword(getUserByEmail.id, {
        password: password,
        isVerified: true,
      });
      return reply.code(200).send({
        success: true,
        data: null,
        msg: PASSWORD_UPDATED,
      });
    }
  } else {
    const getUserByPhone = await getRegisteredUserWithPhone(
      req.body.inputProperty
    );
    if (!getUserByPhone) {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: VERIFY_PHONE,
      });
    } else {
      let password = generateBcryptPassword(req.body.password);
      await updateUserPassword(getUserByPhone.id, {
        password: password,
        isVerified: true,
      });
      return reply.code(200).send({
        success: true,
        data: null,
        msg: PASSWORD_UPDATED,
      });
    }
  }
};

export const deleteUserById = async (req: any, reply: any) => {
  {
    try {
      const result = await deleteUser(req.params.id);
      console.log(result, "--result");
      return reply.code(200).send({
        success: true,
        data: null,
        msg: USER_DELETED,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        data: error,
        msg: SERVER_ERROR,
      });
    }
  }
};


/**
 * @api {post} /user/check-old-password   Check old password
 * @apiName  Check old password
 * @apiGroup User
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String}  userNewPassword  userNewPassword of User `Mendatory`.
 * @apiDescription  User Service..
 */
export const checkUserOldPassword = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      let userResponse = await getUser(checkValidUser.id);
      if (checkValidUser && checkValidUser.id) {
        console.log('--tet----',req.body.userNewPassword,
          userResponse.password);
        const checkPassword = await comparePassword(
          req.body.userNewPassword,
          userResponse.password
        );
        console.log(checkPassword,'-----checkPassword');
        
        if (checkPassword) {
          return reply.code(400).send({
            success: false,
            data: null,
            msg: PASSOWRD_EXIST,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: PASSOWRD_NOT_EXIST,
          });
        }
      } else {
        return reply.code(403).send({
          success: false,
          data: null,
          msg: INVALID_TOKEN,
        });
      }
    } else {
      return reply.code(401).send({
        success: false,
        data: null,
        msg: UNAUTHORIZED,
      });
    }
  } catch (error: any) {
    console.log(error, "--err");
    if (error && error.message.includes("jwt expired")) {
      return reply.code(401).send({
        success: false,
        data: error,
        msg: JWT_EXPRIED,
      });
    }
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};