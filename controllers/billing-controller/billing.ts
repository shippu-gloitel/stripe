import { NOTFOUND } from "dns";
import {
  // addedCardsList,
  addPlan,
  cancelUserSubscription,
  // checkPaymentStatusById,
  checkExpStatus,
  createRecurringPayment,
  deleteData,
  downloadFile,
  // getCardList,
  // getCards,
  getList,
  // getPaymentHist,
  billingList,
  getPaymentList,
  getSubList,
  getSuscription,
  paymentLink,
  paymentOfUser,
  // updateRecurSubscription,
  userPayStatus,
  updatePaymentOfUser,
  removeCard,
  linkCreate,
  newLinkCall,
  clientSecret,
  getCards,
  // updateStripeRecurringSubscription,
} from "../../services/billing-services/billing";
import { verifyUserJwtToken } from "../../services/user-services/auth.service";
import { getUser } from "../../services/user-services/user.service";
import {
  CORRECT_WEBSITE,
  CREATE_PAYMENT,
  DATA_NOT_FOUND,
  ERROR_OCCURS,
  FIND_DATA,
  INVALID_TOKEN,
  JWT_EXPRIED,
  PRICE_MSG,
  REMOVE_DATA,
  SERVER_ERROR,
  SUBSCRITION_ALREADY,
  UNAUTHORIZED,
  UPDATE_DATA,
} from "../../utils/constants";

/**
 * @api {get} /billing/get-payment   Get payment by user
 * @apiName Get payment
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 */
export const getPaymentListByUser = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        const paymentList = await getPaymentList(checkValidUser.id);
        if (paymentList && paymentList.length > 0) {
          return reply.code(200).send({
            success: true,
            data: paymentList,
            msg: FIND_DATA,
          });
        } else {
          return reply.code(400).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /billing/create-payment-subscription   Create Recurring payment
 * @apiName Recurring payment
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {Number}  cardNumber  CardNumber of User `Mendatory`.
 * @apiParam {Number}  expMonth    ExpMonth of User `Mendatory`.
 * @apiParam {Number}  expYear    ExpYear of User `Mendatory`.
 * @apiParam {String}  cvcNumber  CvcNumber of User `Mendatory`.
 * @apiParam {String}  websiteId  WebsiteId of User `Mendatory`.
 * @apiParam {String}  description  Description of user `Optional`.
 * @apiParam {String}  email  Email of user `Optional`.
 * @apiParam {String}  priceId  PriceId of user `Optional`.
 * @apiDescription  Billing Service..
 */
export const recurringPayment = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        req.body["userId"] = checkValidUser.id;
        const addPaymentByUser = await createRecurringPayment(
          req.body,
          checkValidUser
        );
        if (
          addPaymentByUser == "Data not found" ||
          addPaymentByUser == SUBSCRITION_ALREADY ||
          addPaymentByUser == CORRECT_WEBSITE
        ) {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: addPaymentByUser,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: CREATE_PAYMENT,
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
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /billing/create-plan   create plan
 * @apiName create plan
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {Number}  amount   amount of Plan `Mendatory`.
 * @apiParam {String}  name    name of Plan `Mendatory`.
 * @apiParam {String}  description  Description of Plan `Optional`.
 * @apiParam {String}  productId  productId of Plan `Optional`.
 * @apiParam {Boolean}  active  active of Plan `Optional`.
 * @apiParam {Object}  metadata  metadata of Plan `Optional`.
 * @apiDescription  Billing Service..
 */
export const addPaymentPlan = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        req.body["userId"] = checkValidUser.id;
        const addPaymentByUser = await addPlan(req.body, checkValidUser.email);
        return reply.code(200).send({
          success: true,
          data: addPaymentByUser,
          msg: PRICE_MSG,
        });
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
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {get} /plans/list   Get Plan List
 * @apiName Get Plan List
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 */
export const getPlansList = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        const result = await getList();
        if (result && result.length > 0) {
          return reply.code(200).send({
            success: true,
            data: result,
            msg: FIND_DATA,
          });
        } else {
          return reply.code(400).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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

/**
 * @api {post} /billing/update-payment-subscription  Update subscription
 * @apiName Update subscription
 * @apiGroup Billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {Number}  cardNumber  CardNumber of User `Mendatory`.
 * @apiParam {Number}  expMonth    ExpMonth of User `Mendatory`.
 * @apiParam {Number}  expYear    ExpYear of User `Mendatory`.
 * @apiParam {String}  cvcNumber  CvcNumber of User `Mendatory`.
 * @apiParam {String}  websiteId  WebsiteId of User `Mendatory`.
 * @apiParam {String}  description  Description of user `Optional`.
 * @apiParam {String}  email  Email of user `Optional`.
 * @apiParam {String}  priceId  PriceId of user `Optional`.
 * @apiDescription  Billing Service..
 */
export const updatePayment = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      let userResponse = await getUser(checkValidUser.id);
      if (checkValidUser && checkValidUser.id) {
        req.body["userId"] = checkValidUser.id;
        const addPaymentByUser = await updatePaymentOfUser(
          userResponse,
          req.body
        );
        return reply.code(200).send({
          success: true,
          data: addPaymentByUser,
          msg: UPDATE_DATA,
        });
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
    console.log(error, "---error");

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

/**
 * @api {post}/billing/cancel-payment-subscription   Cancel subscription
 * @apiName Cancel subscription
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String}  websiteId  WebsiteId of User `Mendatory`.
 * @apiDescription  Billing Service..
 */
export const cancelPayment = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      let userResponse = await getUser(checkValidUser.id);
      if (checkValidUser && checkValidUser.id) {
        // req.body["userId"] = checkValidUser.id;
        const cancelPaymentByUser: any = await cancelUserSubscription(
          userResponse,
          req.params.websiteId,
          req.params.languageType
        );
        console.log(cancelPaymentByUser, "--cancelPaymentByUser");

        if (cancelPaymentByUser) {
          return reply.code(cancelPaymentByUser.status).send({
            success: true,
            data: null,
            msg: cancelPaymentByUser.msg,
          });
        } else {
          return reply.code(400).send({
            success: true,
            data: null,
            msg: ERROR_OCCURS,
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

/**
 * @api {post} /billing/get-payment-subscription/:websiteId   Get subscription
 * @apiName Get subscription
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 * @apiParam {String} websiteId unique ID.
 */
export const getSubscriptionList = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        const getPaymentByUser = await getSuscription(
          checkValidUser,
          req.params.websiteId
        );
        if (getPaymentByUser) {
          return reply.code(200).send({
            success: true,
            data: getPaymentByUser,
            msg: FIND_DATA,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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
  } catch (error) {
    console.log(error);

    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {get} /billing/get-cards   Get Cards
 * @apiName Get Cards
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 */
export const getUserCardList = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        const getCardsByUser = await getCards(checkValidUser);
        if (getCardsByUser && getCardsByUser.length > 0) {
          return reply.code(200).send({
            success: true,
            data: getCardsByUser,
            msg: FIND_DATA,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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
    console.log(error, "---");
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

/**
 * @api {get} /billing/delete-card/:cardId   Delete Cards
 * @apiName Delete Cards
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String} cardId unique ID.
 * @apiDescription  Billing Service..
 */
export const deleteAddedCard = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        const getCardsByUser: any = await removeCard(
          checkValidUser,
          req.params.cardId
        );
        if (getCardsByUser) {
          return reply.code(getCardsByUser.status).send({
            success: true,
            data: null,
            msg: getCardsByUser.msg,
          });
        } else {
          return reply.code(getCardsByUser.status).send({
            success: true,
            data: null,
            msg: getCardsByUser.msg,
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
    console.log(error, "---");
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

/**
 * @api {get} /billing/payment-history   Get Payment History
 * @apiName Get Payment History
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 */
export const getTransactionHistory = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        const getCardsByUser = await billingList(checkValidUser);
        // console.log("--getCardsByUser--", getCardsByUser);

        if (getCardsByUser && getCardsByUser.length > 0) {
          return reply.code(200).send({
            success: true,
            data: getCardsByUser,
            msg: FIND_DATA,
          });
        } else {
          return reply.code(200).send({
            data: null,
            success: true,
            msg: DATA_NOT_FOUND,
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
    console.log(error);
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

export const deleteProduct = async (req: any, reply: any) => {
  await deleteData(req.params.id);
  return reply.code(200).send({
    success: true,
    data: null,
    msg: REMOVE_DATA,
  });
};

/**
 * @api {post} /billing/create-payment-link   Create payment link
 * @apiName Create payment
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 */
export const recurringPaymentLink = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        req.body["userId"] = checkValidUser.id;
        const addPaymentByUser = await paymentLink(req.body);
        if (addPaymentByUser) {
          return reply.code(200).send({
            success: true,
            data: addPaymentByUser,
            msg: CREATE_PAYMENT,
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
    console.log(error);
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

/**
 * @api {get} /billing/subscriptions-list   Get Subscriptions History
 * @apiName Get Subscriptions History
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 */

export const getUserSubscriptionList = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        const addPaymentByUser = await getSubList(checkValidUser.id);
        if (addPaymentByUser) {
          return reply.code(200).send({
            success: true,
            data: addPaymentByUser,
            msg: DATA_NOT_FOUND,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /billing/create-secure-payment   create-secure-payment
 * @apiName create-secure-payment
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {Number}  cardNumber  CardNumber of User `Mendatory`.
 * @apiParam {Number}  expMonth    ExpMonth of User `Mendatory`.
 * @apiParam {Number}  expYear    ExpYear of User `Mendatory`.
 * @apiParam {String}  cvcNumber  CvcNumber of User `Mendatory`.
 * @apiParam {String}  websiteId  WebsiteId of User `Mendatory`.
 * @apiParam {String}  description  Description of user `Optional`.
 * @apiParam {String}  email  Email of user `Optional`.
 * @apiParam {String}  priceId  PriceId of user `Optional`.
 * @apiDescription  Billing Service..
 */
export const createPaymentOfUser = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      console.log(checkValidUser, "---checkValidUser");

      if (checkValidUser && checkValidUser.id) {
        let userResponse = await getUser(checkValidUser.id);
        console.log(userResponse, "---userResponse");

        // req.body["email"] = userResponse.email;
        // req.body["userId"] = checkValidUser.id;
        const addPaymentByUser = await paymentOfUser(req.body, userResponse);
        if (addPaymentByUser) {
          return reply.code(200).send({
            success: true,
            data: addPaymentByUser,
            msg: CREATE_PAYMENT,
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
    console.log(error);
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

/**
 * @api {get} /billing/payment-status/:websiteId   Get Payment status
 * @apiName Get Payment status
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String} websiteId unique ID.
 * @apiDescription  Billing Service..
 */

export const checkUserPaymentStatus = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        let data = {
          websiteId: req.params.websiteId,
          userId: checkValidUser.id,
        };
        const addPaymentByUser = await checkExpStatus(data);
        if (addPaymentByUser && addPaymentByUser.length > 0) {
          return reply.code(200).send({
            success: true,
            data: addPaymentByUser,
            msg: FIND_DATA,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {get} /billing/status/:websiteId   Get Payment status
 * @apiName Get Payment status
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String} websiteId unique ID.
 * @apiDescription  Billing Service..
 */

export const getStatusById = async (req: any, reply: any) => {
  try {
    let data = {
      websiteId: req.params.websiteId,
    };
    const addPaymentByUser = await checkExpStatus(data);
    if (addPaymentByUser) {
      return reply.code(200).send({
        success: true,
        data: addPaymentByUser,
        msg: FIND_DATA,
      });
    } else {
      return reply.code(200).send({
        success: true,
        data: null,
        msg: DATA_NOT_FOUND,
      });
    }
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {get} /download-invoice/:websiteId   Download invoices
 * @apiName Download invoice
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String} websiteId unique ID.
 * @apiDescription  Billing Service..
 */

export const downloadInvoice = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        let data = {
          websiteId: req.params.websiteId,
          userId: checkValidUser.id,
        };
        const addPaymentByUser = await downloadFile(data);
        if (addPaymentByUser && addPaymentByUser.length > 0) {
          return reply.code(200).send({
            success: true,
            data: addPaymentByUser,
            msg: FIND_DATA,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {get} /update-subscription-status/:websiteId   Update status
 * @apiName Update status
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiParam {String} websiteId unique ID.
 * @apiDescription  Billing Service..
 */

export const updateSubscriptionStatus = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        let data = {
          websiteId: req.params.websiteId,
          userId: checkValidUser.id,
          languageType: req.params.languageType,
        };
        let userResponse = await getUser(checkValidUser.id);
console.log(userResponse,'-userResponse');

        const addPaymentByUser = await userPayStatus(data, userResponse);
        if (addPaymentByUser) {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: UPDATE_DATA,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /billing/payment-url   payment url
 * @apiName  payment url
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 */

export const checkPaymentLink = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
      if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        let data = {
          websiteId: req.params.websiteId,
          userId: checkValidUser.id,
          languageType: req.params.languageType,
        };
        console.log(data, "--data");

        let userResponse = await getUser(checkValidUser.id);

        const addPaymentByUser = await linkCreate(req.body, userResponse);
        if (addPaymentByUser) {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: UPDATE_DATA,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /billing/payment-url   payment url
 * @apiName  payment url
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 */

export const newPaymentCall = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        let data = {
          websiteId: req.params.websiteId,
          userId: checkValidUser.id,
          languageType: req.params.languageType,
        };
        console.log(data, "--data");

        let userResponse = await getUser(checkValidUser.id);

        const addPaymentByUser: any = await newLinkCall(req.body, userResponse);
        if (addPaymentByUser) {
          return reply.code(addPaymentByUser.code).send({
            success: addPaymentByUser.success,
            data: addPaymentByUser.data,
            msg: addPaymentByUser.msg,
          });
        } else {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: DATA_NOT_FOUND,
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
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /billing/payment-url   payment url
 * @apiName  payment url
 * @apiGroup billing
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  Billing Service..
 */

export const createClientSecret = async (req: any, reply: any) => {
  try {
    // let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJzaGFudGl0ZXN0QGdtYWlsLmNvbSIsImlucHV0UHJvcGVydHkiOiJzaGFudGl0ZXN0QGdtYWlsLmNvbSIsImlhdCI6MTY4MjA2NjExMywiZXhwIjoxNjgyMTUyNTEzfQ.-aHtklxcjf9m_u3-IwaQBbw9PMeK236dMbgBM7xZr44";
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        let userResponse = await getUser(checkValidUser.id);
        if (userResponse) {
          const addPaymentByUser = await clientSecret(req.body, userResponse);
          if (addPaymentByUser) {
            return reply.code(200).send({
              success: true,
              data: addPaymentByUser,
              msg: "Create link successfully",
            });
          } else {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: DATA_NOT_FOUND,
            });
          }
        } else {
          return reply.code(404).send({
            success: false,
            data: null,
            msg: NOTFOUND,
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
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};
