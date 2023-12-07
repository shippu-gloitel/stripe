import { v4 as uuidv4 } from "uuid";
import { setRedisData } from "../../redis/redis.service";
import { 
  stringIsAValidUrl } from "../../helper/validator";
import { verifyJwtToken } from "../../services/user-services/auth.service";
import {
  createWebsite,
  getList,
  updateWebsiteByUser,
  insertBulkWebsite,
  removeWebsiteById,
  getWebsite,
  saveChatboxBehavior,
  updateChatboxBehavior,
  getWebsiteByUrl,
  getWebsiteByDomain,
  getchatBotUrl,
  getStatusList,
  getAddedList,
} from "../../services/website-services/websiteServices";
import {
  ADDED_WEBSITE,
  CHECK_WEBSITE,
  DATA_NOT_FOUND,
  ERROR_OCCURS,
  FIND_DATA,
  INVALID_TOKEN,
  JWT_EXPRIED,
  REMOVE_DATA,
  SERVER_ERROR,
  UNAUTHORIZED,
  UPDATE_DATA,
  USER_NOT_FOUND,
  // VALID_NAME,
  VALID_URL,
} from "../../utils/constants";
import {
  getUser,
  // updateProfile,
} from "../../services/user-services/user.service";

/**
 * @api {post} /website/add-website   Add website
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String} name          Mandatory name.
 * @apiParam {String} url           Mandatory url.
 * @apiParam {String} icon          Optional icon.
 * @apiName Add Websites
 * @apiGroup Website
 * @apiDescription  Website Service..
 */
export const addWebsite = async (req: any, reply: any) => {
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
          const user = await getUser(decoded.id);
          console.log(user, "--user");
          if (user && user.id) {
            // if (user && user.registerType == "phone" && user.email == null) {
            //   console.log(user.email, "---email null");
            //   await updateProfile(
            //     { id: decoded.id },
            //     {
            //       email: req.body.email,
            //     }
            //   );
            // } else {
            //   req.body["email"] = user.email;
            // }
            const validator = await stringIsAValidUrl(req.body.url);
            // const isNameValidator = await isName(req.body.name);
            if (validator) {
              // if (isNameValidator) {
                let myuuid: any = uuidv4();
                req.body["userId"] = decoded.id;
                req.body["userName"] = `${user.firstName} ${user.lastName}`;
                req.body["websiteId"] = myuuid;
                req.body["status"] = true;
                req.body["email"] = user.email;

                // req.body["priceId"] = "price_1MgqDNIifGdcmTlmZ6g8CRdk";
                req.body["priceId"] = process.env.PRICE_ID;

                let websiteRes = await createWebsite(req.body, user);
                if (websiteRes) {
                  return reply.code(websiteRes.code).send({
                    success: websiteRes.success,
                    data: websiteRes.data,
                    msg: websiteRes.msg,
                  });
                } else
                  return reply.code(400).send({
                    success: false,
                    data: null,
                    msg: ERROR_OCCURS,
                  });
              // } 
              // else {
              //   return reply.code(400).send({
              //     success: false,
              //     data: null,
              //     msg: VALID_NAME,
              //   });
              // }
            } else {
              return reply.code(400).send({
                success: false,
                data: null,
                msg: VALID_URL,
              });
            }
          } else {
            return reply.code(404).send({
              success: false,
              data: null,
              msg: USER_NOT_FOUND,
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
 * @api {get} /website/get-website-list   get website
 * @apiName Get Websites
 * @apiGroup Website
 * @apiDescription  Website Service..
 */
export const getWebsiteList = async (req: any, reply: any) => {
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
          const user = await getUser(decoded.id);
          if (user && user.id) {
            let websiteRes = await getList(decoded.id);
            if (websiteRes && websiteRes.length > 0) {
              return reply.code(200).send({
                success: true,
                data: websiteRes,
                msg: FIND_DATA,
              });
            } else
              return reply.code(200).send({
                success: true,
                data: null,
                msg: DATA_NOT_FOUND,
              });
          } else {
            return reply.code(404).send({
              success: false,
              data: null,
              msg: USER_NOT_FOUND,
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
 * @api {post} /website/update-website  Update Website
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String} name          Mandatory name.
 * @apiParam {String} url           Mandatory url.
 * @apiParam {String} icon          Optional icon.
 * @apiName Update Website Status
 * @apiGroup Website
 * @apiDescription  Website Service..
 */
export const updateWebsite = async (req: any, reply: any) => {
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
          if (req.body.url) {
            const validator = await stringIsAValidUrl(req.body.url);
            if (!validator) {
              return reply.code(400).send({
                success: false,
                data: null,
                msg: VALID_URL,
              });
            }
          } 
          // else if (req.body.name) {
          //   const isNameValidator = await isName(req.body.name);
          //   if (!isNameValidator) {
          //     return reply.code(400).send({
          //       success: false,
          //       data: null,
          //       msg: VALID_NAME,
          //     });
          //   }
          // }
          let websiteRes = await updateWebsiteByUser(
            req.body.websiteId,
            req.body
          );
          return reply.code(websiteRes.code).send({
            success: websiteRes.status,
            data: null,
            msg: websiteRes.msg,
          });
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
 * @api {post} /website/delete-website/:id  Delete Website
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Delete Website
 * @apiGroup Website
 * @apiParam {Number}  id  `Mendatory`.
 * @apiDescription  Website Service..
 */
export const deleteWebsite = async (req: any, reply: any) => {
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
          let websiteRes = await removeWebsiteById(
            req.params.websiteId,
            decoded
          );
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: REMOVE_DATA,
            });
          } else
            return reply.code(400).send({
              success: false,
              data: null,
              msg: ERROR_OCCURS,
            });
        }
      });
    } else {
      return reply.code(403).send({
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
 * @api {get} /website/get-website/:websiteId  Get Website
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Get Website
 * @apiGroup Website
 * @apiParam {String}  websiteId  `Mendatory`.
 * @apiDescription  Website Service..
 */
export const getWebsiteById = async (req: any, reply: any) => {
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
          let websiteRes = await getWebsite(req.params.websiteId, decoded);
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: websiteRes,
              msg: FIND_DATA,
            });
          } else
            return reply.code(200).send({
              success: false,
              data: null,
              msg: DATA_NOT_FOUND,
            });
        }
      });
    } else {
      return reply.code(403).send({
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
 * @api {get} /website/get-website-url/:url  Get Website
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Get Website
 * @apiGroup Website
 * @apiParam {String}  url  `Mendatory`.
 * @apiDescription  Website Service..
 */
export const getWebsiteUrl = async (req: any, reply: any) => {
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
          let websiteRes = await getWebsiteByUrl(req.params.url);
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: websiteRes,
              msg: CHECK_WEBSITE,
            });
          } else
            return reply.code(200).send({
              success: false,
              data: null,
              msg: DATA_NOT_FOUND,
            });
        }
      });
    } else {
      return reply.code(403).send({
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
 * @api {get} /website/:websiteId/:url Get Website
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Get Website
 * @apiGroup Website
 * @apiParam {String}  websiteId  `Mendatory`.
 * @apiParam {String}  url  `Mendatory`.
 * @apiDescription  Website Service..
 */
export const getWebsiteWithIdAndUrl = async (req: any, reply: any) => {
  try {
    const websiteInfo = await getWebsiteByDomain(
      req.params.websiteId,
      req.params.url
    );
    const setRedis = await setRedisData(req.params.websiteId, {
      id: "1",
      name: "test",
    });
    console.log(setRedis, "--setRedis");

    if (websiteInfo.status) {
      return reply.code(200).send({
        success: true,
        data: null,
        msg: websiteInfo.msg,
      });
    } else {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: websiteInfo.msg,
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
 * @api {post} /website/add-bulk-websites  Add Website
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName ADD Website
 * @apiGroup Website
 * @apiDescription  Website Service..
 */
export const addBilkWebsite = async (req: any, reply: any) => {
  try {
    let listOfWebsite: any = [];
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
          for (let index = 0; index < req.body.data.length; index++) {
            const element = req.body.data[index];
            let myuuid: any = uuidv4();
            element["userId"] = decoded.id;
            element["websiteId"] = myuuid;
            listOfWebsite.push(element);
          }
          let websiteRes = await insertBulkWebsite(listOfWebsite);
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: ADDED_WEBSITE,
            });
          } else
            return reply.code(400).send({
              success: false,
              data: null,
              msg: ERROR_OCCURS,
            });
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
 * @api {post} /website/chatbox-behavior Chatbox Behavior
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Chatbox Behavior
 * @apiGroup Website
 * @apiDescription  Website Service..
 */
export const chatboxBehavior = async (req: any, reply: any) => {
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
          req.body["userId"] = decoded.id;
          let websiteRes = await saveChatboxBehavior(req.body);
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: UPDATE_DATA,
            });
          } else
            return reply.code(400).send({
              success: false,
              data: null,
              msg: ERROR_OCCURS,
            });
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
 * @api {post} /website/chatbox-behavior-update Chatbox Behavior
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Chatbox Behavior
 * @apiGroup Website
 * @apiDescription  Website Service..
 */
export const chatboxBehaviorUpdate = async (req: any, reply: any) => {
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
          let websiteRes = await updateChatboxBehavior(req.body, decoded.id);
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: UPDATE_DATA,
            });
          } else
            return reply.code(400).send({
              success: false,
              data: null,
              msg: ERROR_OCCURS,
            });
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
 * @api {get} /fetch-details/:websiteId  Get Website
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Get Website
 * @apiGroup Website
 * @apiParam {String}  websiteId  `Mendatory`.
 * @apiDescription  Website Service..
 */
export const findWebsiteForChatBot = async (req: any, reply: any) => {
  try {
    let websiteRes = await getchatBotUrl(req.params.websiteId);
    console.log(websiteRes, "--websiteRes");

    if (websiteRes) {
      return reply.code(200).send({
        success: true,
        data: websiteRes,
        msg: FIND_DATA,
      });
    } else
      return reply.code(200).send({
        success: false,
        data: null,
        msg: DATA_NOT_FOUND,
      });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /website/chatbox-appearance Chatbox appearance
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Chatbox appearance
 * @apiGroup Website
 * @apiDescription  Website Service..
 */
export const chatbotAppearance = async (req: any, reply: any) => {
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
          let websiteRes = await updateChatboxBehavior(req.body, decoded.id);
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: UPDATE_DATA,
            });
          } else
            return reply.code(400).send({
              success: false,
              data: null,
              msg: ERROR_OCCURS,
            });
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
 * @api {get} /get-chatbox-appearance/:websiteId  Get Website
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Get Website
 * @apiGroup Website
 * @apiParam {String}  websiteId  `Mendatory`.
 * @apiDescription  Website Service..
 */
export const chatbotAppearanceById = async (req: any, reply: any) => {
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
          let websiteRes = await updateChatboxBehavior(req.body, decoded.id);
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: UPDATE_DATA,
            });
          } else
            return reply.code(400).send({
              success: false,
              data: null,
              msg: ERROR_OCCURS,
            });
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
 * @api {get} /website/get-plan-status   get website
 * @apiName Get Websites
 * @apiGroup Website
 * @apiDescription  Website Service..
 */
export const getWebsitePlanlList = async (req: any, reply: any) => {
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
          let websiteRes = await getStatusList(decoded.id);
          if (websiteRes && websiteRes.length > 0) {
            return reply.code(200).send({
              success: true,
              data: websiteRes,
              msg: FIND_DATA,
            });
          } else
            return reply.code(200).send({
              success: true,
              data: null,
              msg: DATA_NOT_FOUND,
            });
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
 * @api {get} /website/added-website-list   added website list
 * @apiName added Websites list
 * @apiGroup Website
 * @apiDescription  Website Service..
 */
export const getAddedWebsiteList = async (req: any, reply: any) => {
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
          let websiteRes = await getAddedList(decoded.id);
          if (websiteRes && websiteRes.length > 0) {
            return reply.code(200).send({
              success: true,
              data: websiteRes,
              msg: FIND_DATA,
            });
          } else
            return reply.code(200).send({
              success: true,
              data: null,
              msg: DATA_NOT_FOUND,
            });
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