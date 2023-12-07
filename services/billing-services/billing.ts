import { NOTFOUND } from "dns";
import { config } from "../../config";
import {
  sendMailToUser,
  sendProPlanMailToUser,
  sendTrailEndMailToUser,
} from "../../helper/mail-service";
import {
  CANCEL_PLAN,
  CARD_DELETE,
  DATA_NOT_FOUND,
  ERROR_OCCURS,
  SUBSCRITION_ALREADY,
  SUBSCRITION_CANCEL,
  UPDATE_DATA,
} from "../../utils/constants";
import {
  cancelSubscriptionObj,
  expirySubscriptionObj,
  footerContentEN,
  proPlanMailContent,
  trialEndPlanMailContent,
  updateSubscriptionObj,
} from "../../utils/email-constants";
import {
  cancelSubscriptionJPObj,
  expirySubscriptionJPObj,
  footerContentJP,
  proPlanMailContentJP,
  trialEndPlanMailContentJP,
  updateSubscriptionJPObj,
} from "../../utils/jp-email-constants";
import {
  addPayPrice,
  // getPrice
} from "../stripe-service/stripe.service";
import { updateUserCustomerId } from "../user-services/user.service";
import {
  cancelWebsiteSub,
  getchatBotUrl,
  getWebsite,
} from "../website-services/websiteServices";
import { getUser } from "../../services/user-services/user.service";

const Models = require("../../models");
// const sequelize = require("sequelize");
// const { Op } = require("sequelize");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const billing = Models.billing;
const cards = Models.cards;
const prices = Models.prices;
const websites = Models.websites;
const billingHistory = Models.billingHistory;
const trialDays = Number(process.env.TRAIL);
const productId = process.env.PRODUCT_ID;
const freePlanId = process.env.PRICE_ID;
const addCards = async (data: any, user: any) => {
  console.log(user, "---user");

  const cardResult = await cards.findOne({
    raw: true,
    where: {
      userId: user.id,
      cardId: `${data.cardId}`,
      active: true,
    },
  });
  if (!cardResult) {
    let values = {
      userId: user.id,
      // cardNumber: data.last4,
      // expMonth: data.expMonth,
      // expYear: data.expYear,
      // cvcNumber: data.cvcNumber,
      // cardName: data.cardName,
      cardId: data.cardId,
    };
    // let result = await getCards(data);
    // console.log(result, "---result");

    // for (let i = 0; i < result.length; i++) {
    //   console.log(result.last4, "--result.last4");

    //   if (result.last4 !== tampNumber) {
    //     values["cardName"] = result.cardName;
    //   }
    // }
    console.log(values, "--values");

    await cards.build(values).save();
    return data;
  }
  return cardResult;
};
export const getCardsById = async (data: any, user: any) => {
  let saveCard: any = {};
  const cardResult = await cards.findAll({
    raw: true,
    where: {
      userId: user.userId,
      active: true,
    },
  });
  console.log("get save card: ", cardResult.length);

  for (let index = 0; index < cardResult.length; index++) {
    const element = cardResult[index];
    if (element.cardId !== null) {
      try {
        const card = await stripe.customers.retrieveSource(
          user.customerId,
          element.cardId
        );
        console.log(card, "--card--");

        let tampNum = data.cardNumber
          .toString()
          .substring(data.cardNumber.toString().length - 4);
        if (tampNum === card.last4) {
          saveCard = card;
        }
      } catch (error) {
        console.log(error, "---eee");
        continue;
      }
    }
  }
  return saveCard;
};

export const getPaymentList = async (userId: number) => {
  return await billing.findAll({
    where: { userId: userId },
  });
};

const stripeRecurringSubscription = async (data: any, user: any) => {
  let paymentMethod = await stripe.paymentMethods.create({
    type: config.type,
    card: {
      number: data.cardNumber,
      exp_month: data.expMonth,
      exp_year: data.expYear,
      cvc: data.cvcNumber,
    },
  });
  const createCustomer = await stripe.customers.create({
    email: data.email,
    description: data.description,
    payment_method: paymentMethod.id,
    invoice_settings: {
      default_payment_method: paymentMethod.id,
    },
  });
  const subscription = await stripe.subscriptions.create({
    customer: createCustomer.id,
    items: [{ price: data.priceId }],
    payment_settings: {
      payment_method_types: ["card"],
      save_default_payment_method: "on_subscription",
    },
    expand: ["latest_invoice.payment_intent"],
  });
  let details = {
    websiteId: data.websiteId,
    customerId: createCustomer.id,
    userId: user.id,
    subscriptionId: subscription.id,
    paymentMethodId: paymentMethod.id,
    priceId: data.priceId,
  };
  const result = await billing.build(details).save();
  return result;
};

export const updateStripeRecurringSubscription = async (
  user: any,
  data: any
) => {
  const userResult: any = await billing.findOne({
    where: {
      userId: user.id,
      websiteId: data.websiteId,
      active: true,
    },
  });
  if (userResult) {
    let paymentMethod = await stripe.paymentMethods.create({
      type: config.type,
      card: {
        number: data.cardNumber,
        exp_month: data.expMonth,
        exp_year: data.expYear,
        cvc: data.cvcNumber,
      },
    });
    const updateCustomer = await stripe.customers.update(
      userResult.customerId,
      {
        // payment_method: paymentMethod.id,
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      }
    );
    const subscription = await stripe.subscriptions.create({
      customer: updateCustomer.id,
      items: [{ price: data.priceId }],
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });
    console.log(subscription, "--subscription");
  } else {
    return "User not found";
  }

  const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
  stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: false,
    proration_behavior: "create_prorations",
    items: [
      {
        id: subscription.items.data[0].id,
        price: data.priceId,
      },
    ],
  });
  let details = {
    websiteId: user.websiteId,
    subscriptionId: subscription.id,
  };
  const result = await billing.update(details, {
    raw: true,
    where: {
      userId: user.id,
    },
  });
  return result;
};

export const createRecurringPayment = async (data: any, user: any) => {
  const websiteResult = await getWebsite(data.websiteId, user);
  console.log(websiteResult, "--websiteResult");

  if (websiteResult) {
    const userData = await billing.findOne({
      raw: true,
      where: {
        userId: user.id,
        websiteId: data.websiteId,
        priceId: data.priceId,
        active: true,
      },
    });
    if (!userData) {
      const success = await stripeRecurringSubscription(data, user);
      return success;
    } else {
      if (data.priceId == userData.priceId) {
        return SUBSCRITION_ALREADY;
      } else {
        return "Data not found";
      }
    }
  } else {
    return "Website not found";
  }
};

// Cancels a customer’s subscription
export const cancelUserSubscription = async (
  user: any,
  websiteId: string,
  languageType: string
) => {
  try {
    let data: any = {};
    const userData = await billing.findOne({
      where: {
        userId: user.id,
        websiteId: websiteId,
        active: true,
        sericeStatus: true,
      },
      raw: true,
    });
    if (userData) {
      const deleted = await stripe.subscriptions.del(userData.subscriptionId);
      console.log(deleted);
      await billing.update(
        {
          active: false,
          sericeStatus: false,
        },
        {
          where: {
            userId: user.id,
            websiteId: websiteId,
          },
          raw: true,
        }
      );
      await billingHistory.update(
        {
          active: false,
          status: "canceled",
        },
        {
          where: {
            userId: user.id,
            websiteId: websiteId,
          },
          raw: true,
        }
      );

      await cancelWebsiteSub(websiteId, user);
      const customer = await stripe.customers.retrieve(userData.customerId);
      if (customer && customer.email) {
        let contentByLang: any = {};
        let footerContent: any = {};
        if (languageType === "ja") {
          contentByLang = cancelSubscriptionJPObj;
          footerContent = footerContentJP;
        } else {
          contentByLang = cancelSubscriptionObj;
          footerContent = footerContentEN;
        }
        data["email"] = customer.email;
        await sendMailToUser(data, user, contentByLang, footerContent);
      }
      return {
        status: 200,
        msg: CANCEL_PLAN,
      };
    } else {
      return { status: 404, msg: DATA_NOT_FOUND };
    }
  } catch (error) {
    console.log(error, "-248--error");
    return { status: 400, msg: SUBSCRITION_CANCEL };
  }
};

// get a customer’s subscription
export const getSuscription = async (user: any, websiteId: string) => {
  const userData = await billing.findOne({
    raw: true,
    where: {
      userId: user.id,
      websiteId: websiteId,
    },
  });
  if (userData) {
    const subscription = await stripe.subscriptions.retrieve(
      userData.subscriptionId
    );
    return subscription;
  } else {
    return "Data not found";
  }
};

export const addPlan = async (data: any, email: string) => {
  const price = await addPayPrice(data);
  data["priceId"] = price.id;
  data["name"] = data.name;
  const result = await prices.build(data).save();
  return result;
};

export const getList = async () => {
  return await prices.findAll({
    raw: true,
    where: {
      productId: productId,
      active: true,
    },
    order: [["createdAt", "ASC"]],
  });
};

export const getCards = async (user: any) => {
  console.log(user, "311--user");

  let cardArr: any = [];
  const userData = await billing.findOne({
    raw: true,
    where: {
      userId: user.id,
    },
  });
  console.log(userData, "---userData");

  if (userData && userData.customerId) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: "cus_NkiWXqK5VPsvM1",
    });
    console.log(paymentMethods.data, "---paymentMethods.data");
    if (
      paymentMethods &&
      paymentMethods.data &&
      paymentMethods.data.length > 0
    ) {
      for (let i = 0; i < paymentMethods.data.length; i++) {
        const element = paymentMethods.data[i];

        let cardsData = {
          name: element.billing_details.name,
          last4: element.card.last4,
          exp_month: element.card.exp_month,
          exp_year: element.card.exp_year,
          cardName: element.card.brand,
        };
        cardArr.push(cardsData);
      }
      const key = "last4";
      const arrayUniqueByKey = [
        ...new Map(cardArr.map((item: any) => [item[key], item])).values(),
      ];
      return arrayUniqueByKey;
    } else {
      return cardArr;
    }
  } else {
    return cardArr;
  }
};

export const addedCardsList = async (user: any) => {
  console.log(user, "311--user");
  let cardArr: any = [];
  // const list = await cards.findAll({
  //   where: {
  //     userId: user.id,
  //     active: true,
  //   },
  //   order: [["id", "DESC"]],
  //   raw: true,
  // });
  const userInfo = await billing.findOne({
    raw: true,
    where: { userId: user.id },
  });

  //  const list = await stripe.customers.listSources(userInfo.customerId);
  // console.log(list,'--list');

  // const list = await stripe.paymentMethods.list({
  //   customer: userInfo.customerId,
  //   type: "card",
  // });
  // console.log(list);

  const cardList = await cards.findAll({
    where: { userId: user.id, active: true },
    raw: true,
  });
  console.log(cardList.length, "---cardList");
  for (let index = 0; index < cardList.length; index++) {
    const element = cardList[index];
    if (element.cardId !== null) {
      try {
        const card = await stripe.customers.retrieveSource(
          userInfo.customerId,
          element.cardId
        );
        console.log(card, "--card");
        let cardsData = {
          name: card.brand.toLocaleLowerCase(),
          last4: card.last4,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          cardName: card.brand.toLocaleLowerCase(),
          active: element.active,
          cardId: element.cardId,
        };
        cardArr.push(cardsData);
      } catch (error) {
        console.log(error, "---error list card");
        continue;
      }
    }
  }
  return cardArr;
  // if (list && list.data && list.data.length > 0) {
  //   for (let i = 0; i < list.data.length; i++) {
  //     const element = list.data[i];
  //     console.log(element, "---element");

  //     let cardsData = {
  //       name: element.billing_details.name,
  //       last4: element.card.last4,
  //       exp_month: element.card.exp_month,
  //       exp_year: element.card.exp_year,
  //       cardName: element.card.brand,
  //       // active: element.active,
  //       // cardId: element.cardId,
  //     };
  //     cardArr.push(cardsData);
  //   }
  //   return cardArr;
  // } else {
  //   return cardArr;
  // }
};

export const removeCard = async (user: any, cardId: string) => {
  try {
    console.log(cardId, "--cardId");

    const billingResult = await billing.findOne({
      where: {
        userId: user.id,
        active: true,
        sericeStatus: true,
      },
      raw: true,
    });
    console.log(billingResult, "00billingResult");

    const card = await stripe.customers.retrieveSource(
      billingResult.customerId,
      cardId
    );
    console.log(card, "---card");
    const deleted = await stripe.customers.deleteSource(
      billingResult.customerId,
      cardId
    );
    console.log(deleted, "--deleted");
    await cards.update(
      { active: false },
      {
        where: {
          userId: user.id,
          cardId: cardId,
        },
        raw: true,
      }
    );

    return {
      status: 200,
      msg: CARD_DELETE,
    };
  } catch (error) {
    console.log(error, "---error");

    return {
      status: 400,
      msg: ERROR_OCCURS,
    };
  }
};

export const getPaymentHist = async (user: any) => {
  let txData: any = [];
  const userData = await billing.findOne({
    raw: true,
    where: {
      userId: user.id,
    },
  });
  if (userData && userData.customerId) {
    const customer = await stripe.customers.retrieve(userData.customerId);
    console.log(customer.subscriptions, "-************-customer");

    const paymentIntents = await stripe.paymentIntents.list({
      customer: userData.customerId,
    });
    // console.log(paymentIntents, "---paymentMethods");

    for (let index = 0; index < paymentIntents.data.length; index++) {
      const element = paymentIntents.data[index];
      // console.log(element.charges, "--************element");
      // const charge = await stripe.charges.retrieve(
      //   'ch_3Ms7ujIifGdcmTlm2YfSikGN'
      // );
      // console.log(charge,'--charge');
      // if (element.status == "succeeded") {
      txData.push({
        created: element.created,
        status: element.status,
        amount: Number(element.amount) / 100,
        id: element.payment_method,
        email: customer.email,
        // customer:customer,
      });
      // }
    }
    return txData;
  } else {
    return txData;
  }
};

const getCustById = async (id: number) => {
  return await billing.findOne({
    raw: true,
    where: {
      userId: id,
      sericeStatus: true,
    },
  });
};

export const createFreePlanForUser = async (data: any, user: any) => {
  try {
    let stripeCustomerId: string = "";
    const users = await getCustById(user.id);
    if (users && users.customerId) {
      stripeCustomerId = users.customerId;
    } else {
      const createCustomer = await stripe.customers.create({
        email: data.email,
        description: "Create free trial",
      });
      stripeCustomerId = createCustomer.id;
    }
    await updateUserCustomerId(stripeCustomerId, user.id);
    const planData = await getPlanInfo(data.priceId);
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: data.priceId }],
      trial_period_days: trialDays,
      // cancel_at_period_end: true,
      payment_settings: { save_default_payment_method: "on_subscription" },
      trial_settings: { end_behavior: { missing_payment_method: "pause" } },
    });
    let details = {
      websiteId: data.websiteId,
      customerId: stripeCustomerId,
      userId: user.id,
      subscriptionId: subscription.id,
      priceId: data.priceId,
      priceSourceKey: planData.id,
      startTime: subscription.current_period_start,
      endTime: subscription.current_period_end,
    };
    await billing.build(details).save();
    return true;
  } catch (error) {
    console.log(error, "---plan error");
    throw error;
  }
};

export const deleteData = async (id: string) => {
  const deleted = await stripe.prices.delete(id);
  // const deleted = await stripe.products.del(id);
  return deleted;
};

export const getPlanBySite = async (websiteInfo: any) => {
  let data = await billing.findOne({
    where: {
      userId: websiteInfo.userId,
      websiteId: websiteInfo.websiteId,
      sericeStatus: true,
    },
    attributes: ["priceSourceKey"],
    include: [{ model: prices }],
    raw: true,
    nest: true,
  });
  return data;
};

export const getPlanInfo = async (priceId: any) => {
  let data = await prices.findOne({
    raw: true,
    where: {
      priceId: priceId,
    },
  });
  return data;
};

export const getCustomerById = async (data: any) => {
  return await billing.findOne({
    raw: true,
    where: {
      websiteId: data.websiteId,
      userId: data.userId,
      sericeStatus: true,
      active: true,
    },
  });
};

export const paymentLink = async (data: any) => {
  const paymentDetail = await getCustomerById(data);
  console.log(paymentDetail, "---paymentDetail");
  if (paymentDetail) {
    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.DOMAIN}`,
      cancel_url: `${process.env.DOMAIN}`,
      line_items: [{ price: data.priceId, quantity: 1 }],
      mode: "subscription",
      customer: paymentDetail.customerId,
    });

    const planData = await getPlanInfo(data.priceId);
    let details = {
      websiteId: data.websiteId,
      userId: data.userId,
      priceId: data.priceId,
      priceSourceKey: planData.id,
      sessionId: session.id,
    };
    // await getCurrentSub(session.id);
    // await subscriptions.build(details).save();
    await billing.update(details, {
      raw: true,
      where: {
        userId: data.userId,
        websiteId: data.websiteId,
      },
    });
    return session.url;
  } else {
    return DATA_NOT_FOUND;
  }
};

export const getCurrentSub = async (id: string) => {
  const sessionData = await stripe.checkout.sessions.retrieve(id);
  return sessionData;
};

export const cancelFreeSub = async (data: any) => {
  try {
    const userData = await billing.findOne({
      where: {
        userId: data.id,
        websiteId: data.websiteId,
        active: true,
        sericeStatus: true,
      },
      raw: true,
    });
    if (userData) {
      await stripe.subscriptions.del(userData.subscriptionId);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error, ":cancel sub--");
    return false;
    // throw error;
  }
};
export const updateUserSub = async (data: any) => {
  try {
    const sessionData = await getCurrentSub(data.sessionId);
    console.log(sessionData, "--by user-sessionData");
    if (
      sessionData &&
      sessionData.status === "complete" &&
      sessionData.payment_status === "paid"
    ) {
      const isUpdate = {
        subscriptionId: sessionData.subscription,
        startTime: sessionData.created,
        endTime: sessionData.expires_at,
        sessionId: null,
      };
      // let deleteSub = await cancelFreeSub(data.subscriptionId);
      // console.log(deleteSub, "old subscription deleted");
      await billing.update(isUpdate, {
        raw: true,
        where: {
          userId: data.userId,
          websiteId: data.websiteId,
        },
      });
    }
  } catch (error) {
    throw error;
  }
};

export const getAllPayments = async () => {
  return await billing.findAll({
    raw: true,
    where: {
      sericeStatus: true,
      active: false,
    },
  });
};

export const cancelUserFreePlan = async (data: any) => {
  // cancel sub
  let dataTamp: any = {};
  let user = {};
  const customer = await stripe.customers.retrieve(data.customerId);
  if (customer && customer.email) {
    dataTamp["email"] = customer.email;
    dataTamp["userName"] = "Member";
    let contentByLang: any = {};
    let footerContent: any = {};
    if (data.languageType === "ja") {
      contentByLang = expirySubscriptionJPObj;
      footerContent = footerContentJP;
    } else {
      contentByLang = expirySubscriptionObj;
      footerContent = footerContentEN;
    }
    await sendMailToUser(dataTamp, user, contentByLang, footerContent);
  }
  const cancelSub = await cancelFreeSub(data);
  console.log(cancelSub, "--cancelSub");
  if (cancelSub) {
    const isUpdate = {
      sericeStatus: false,
      active: false,
    };
    await billing.update(isUpdate, {
      raw: true,
      where: {
        userId: data.userId,
        websiteId: data.websiteId,
      },
    });
    await websites.update(
      { subscriptionStatus: false },
      {
        where: {
          userId: data.userId,
          websiteId: data.websiteId,
        },
      }
    );
  }
};

export const freeTrailEndMail = async (data: any) => {
  let dataTamp: any = {};
  let user: any = {};
  const result = await getUser(data.userId);
  if (result && result.email) {
    user = result;
  } else {
    const customer = await stripe.customers.retrieve(data.customerId);
    if (customer && customer.email) {
      user = customer;
    }
  }
  if (user && user.email) {
    dataTamp["email"] = user.email;
    dataTamp["name"] = "Dear";
    let contentByLang: any = {};
    if (data.languageType === "ja") {
      contentByLang = trialEndPlanMailContentJP;
    } else {
      contentByLang = trialEndPlanMailContent;
    }
    await sendTrailEndMailToUser(dataTamp, contentByLang);
  }
};

export const getSubList = async (userId: number) => {
  return await billing.findAll({
    raw: true,
    where: {
      userId: userId,
    },
  });
};

export const getCurrentPlanByUser = async (websiteId: string, user: any) => {
  return await billing.findOne({
    where: {
      websiteId: websiteId,
      userId: user.id,
      active: true,
      sericeStatus: true,
    },
    raw: true,
  });
};

export const paymentOfUser = async (data: any, user: any) => {
  // Save card of user
  const users = await getCustById(user.id);
  console.log(users, "--854-users");

  if (user) {
    let paymentMethod = await stripe.paymentMethods.create({
      type: config.type,
      card: {
        number: data.cardNumber,
        exp_month: data.expMonth,
        exp_year: data.expYear,
        cvc: data.cvcNumber,
      },
    });
    let stripeCustomerId: any = "";
    let customerCard: any = {};
    if (users && users.id && users.customerId) {
      console.log(users, "---8666users");

      const getCard = await getCardsById(data, users);
      if (getCard && getCard.id) {
        console.log(getCard, "---getCard");
      } else {
        const token = await stripe.tokens.create({
          card: {
            number: data.cardNumber,
            exp_month: data.expMonth,
            exp_year: data.expYear,
            cvc: data.cvcNumber,
          },
        });
        console.log(token, "---token 719&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
        customerCard = await stripe.customers.createSource(users.customerId, {
          source: token.id,
        });
        console.log(customerCard, "---customerCard");
        data["cardName"] = paymentMethod.card.brand;
        data["last4"] = paymentMethod.card.last4;
        data["cardId"] = customerCard.id;
        const cardInfo = await addCards(data, user);
        console.log(cardInfo, "---cardInfo");
      }
      console.log(paymentMethod, "---paymentMethod");

      const paymentMethod1 = await stripe.paymentMethods.attach(
        paymentMethod.id,
        { customer: users.customerId }
      );
      console.log(paymentMethod1, "--paymentMethod1");

      const customer = await stripe.customers.update(users.customerId, {
        description: data.description,
        email: data.email,
        address: {
          city: "",
          country: data.country,
          line1: data.address,
        },
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
      console.log(customer, "--customer");

      stripeCustomerId = users.customerId;
    } else {
      const createCustomer = await stripe.customers.create({
        email: data.email,
        description: data.description,
        payment_method: paymentMethod.id,
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
      stripeCustomerId = createCustomer.id;
    }
    // const getCard = await getCardsById(data, user);
    // if (getCard && getCard.id) {
    //   console.log(getCard, "---getCard");
    // } else {
    const token = await stripe.tokens.create({
      card: {
        number: data.cardNumber,
        exp_month: data.expMonth,
        exp_year: data.expYear,
        cvc: data.cvcNumber,
      },
    });
    console.log(token, "---token 719&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    customerCard = await stripe.customers.createSource(stripeCustomerId, {
      source: token.id,
    });
    console.log(customerCard, "---customerCard");
    data["cardName"] = paymentMethod.card.brand;
    data["last4"] = paymentMethod.card.last4;
    data["cardId"] = customerCard.id;
    const cardInfo = await addCards(data, user);
    console.log(cardInfo, "---cardInfo");
    // }
    const currentPlan = await getCurrentPlanByUser(data.websiteId, user);
    console.log(currentPlan, "---currentPlan");
    if (currentPlan && currentPlan.priceId === freePlanId) {
      const deleted = await stripe.subscriptions.del(
        currentPlan.subscriptionId
      );
      console.log(deleted);
    }
    console.log(stripeCustomerId, "---createCustomer");
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: data.priceId }],
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: "any",
          },
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });
    console.log(subscription, "-----626 sub%%%%%%%%%%");
    data["paymentUrl"] = subscription.latest_invoice.hosted_invoice_url;
    let details = {
      // websiteId: data.websiteId,
      subscriptionId: subscription.id,
      priceId: data.priceId,
      // amount: planData.amount,
      // priceSourceKey: planData.id,
      startTime: subscription.current_period_start,
      endTime: subscription.current_period_end,
      sericeStatus: true,
      active: true,
    };
    await billing.update(details, {
      raw: true,
      where: {
        userId: user.id,
        websiteId: data.websiteId,
      },
    });
    let txData = {
      userId: user.id,
      websiteId: data.websiteId,
      created: subscription.created,
      status: subscription.latest_invoice.payment_intent.status,
      amount: Number(subscription.latest_invoice.payment_intent.amount) / 100,
      invoiceId: subscription.latest_invoice.payment_intent.invoice,
      email: data.email,
      customerId: subscription.latest_invoice.payment_intent.customer,
      subscriptionId: subscription.id,
      active: true,
    };
    await billingHistory.build(txData).save();
    const getData = await getchatBotUrl(data.websiteId);
    console.log(getData, "--get-");
    data["url"] = getData?.url ? getData?.url : "";
    // await sendMailToUser(data, user);
    return data;
  } else {
    return "User not found";
  }
};

export const checkPaymentStatusById = async (data: any) => {
  const createdPayment = await getCustomerById(data);

  console.log(createdPayment, "---createdPayment");

  const subscription = await stripe.subscriptions.retrieve(
    "sub_1Mn3DhIifGdcmTlmcQaRxx1E"
  );
  console.log(subscription, "----609subscription");
  return subscription;
};

export const updateRecurSubscription = async (user: any, data: any) => {
  const updateSub = await getCustomerById(user);
  const subscription = await stripe.subscriptions.update(
    `${updateSub.subscriptionId}`,
    {
      customer: updateSub.customerId,
      items: [{ price: data.priceId }],
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: "any",
          },
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
    }
  );
  console.log(subscription);
  return subscription;
};

// update
export const updatePaymentOfUser = async (user: any, data: any) => {
  console.log(data, "--data");

  const updateSub = await getCustomerById(data);
  if (updateSub && updateSub.subscriptionId) {
    let customerCard: any = {};
    const users = await getCustById(user.id);
    // Save card of user
    let paymentMethod = await stripe.paymentMethods.create({
      type: config.type,
      card: {
        number: data.cardNumber,
        exp_month: data.expMonth,
        exp_year: data.expYear,
        cvc: data.cvcNumber,
      },
    });
    console.log(paymentMethod, "---paymentMethod");
    let tampNum = data.cardNumber
      .toString()
      .substring(data.cardNumber.toString().length - 4);
    console.log(tampNum, "--tampNum");

    const getCard = await getCardsById(data, users);
    if (getCard && getCard.id) {
      console.log(getCard, "---getsaveCard");
    } else {
      const token = await stripe.tokens.create({
        card: {
          number: data.cardNumber,
          exp_month: data.expMonth,
          exp_year: data.expYear,
          cvc: data.cvcNumber,
        },
      });
      console.log(token, "---token 719&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
      customerCard = await stripe.customers.createSource(users.customerId, {
        source: token.id,
      });
      console.log(customerCard, "---customerCard");
      data["cardName"] = paymentMethod.card.brand;
      data["last4"] = paymentMethod.card.last4;
      data["cardId"] = customerCard.id;
      const cardInfo = await addCards(data, user);
      console.log(cardInfo, "---cardInfo");
    }

    let stripeCustomerId: any = "";
    console.log(users);

    if (users && users.customerId) {
      const paymentMethod1 = await stripe.paymentMethods.attach(
        paymentMethod.id,
        { customer: users.customerId }
      );
      console.log(paymentMethod1, "--paymentMethod1");

      const customer = await stripe.customers.update(users.customerId, {
        description: data.description,
        email: data.email,
        address: {
          city: "",
          country: data.country,
          line1: data.address,
        },
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
      console.log(customer, "--customer");

      stripeCustomerId = users.customerId;
    }

    console.log(stripeCustomerId, "---createCustomer");

    const subscription = await stripe.subscriptions.update(
      `${updateSub.subscriptionId}`,
      {
        // customer: stripeCustomerId,
        items: [{ price: data.priceId, quantity: 1 }],
        payment_settings: {
          payment_method_options: {
            card: {
              request_three_d_secure: "any",
            },
          },
          payment_method_types: ["card"],
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
        proration_behavior: "always_invoice",
      }
    );
    const subscriptionData = await stripe.subscriptions.retrieve(
      updateSub.subscriptionId
    );
    console.log(subscriptionData.items, "--- subscriptionData.items");

    if (updateSub && updateSub.subscriptionId) {
      const deleted = await stripe.subscriptionItems.del(
        subscriptionData.items.data[0].id
      );
      console.log("816--subscription", deleted);
    }
    console.log(subscription.items, "-----item&&&&&&");

    console.log(subscription, "-----626 sub%%%%%%%%%%");
    console.log(
      "payment_settings---",
      subscription.payment_settings.payment_method_options.card,
      "---payment_settings"
    );

    data["paymentUrl"] = subscription.latest_invoice.hosted_invoice_url;
    const planData = await getPlanInfo(data.priceId);
    console.log(planData, "--planData");

    let details = {
      // websiteId: data.websiteId,
      subscriptionId: subscription.id,
      priceId: data.priceId,
      // amount: planData.amount,
      // priceSourceKey: planData.id,
      startTime: subscription.current_period_start,
      endTime: subscription.current_period_end,
      sericeStatus: true,
    };
    await billing.update(details, {
      raw: true,
      where: {
        userId: user.id,
        websiteId: data.websiteId,
      },
    });
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    let txData = {
      userId: user.id,
      websiteId: data.websiteId,
      created: subscription.created,
      status: subscription.latest_invoice.payment_intent.status,
      amount: Number(subscription.latest_invoice.payment_intent.amount) / 100,
      invoiceId: subscription.latest_invoice.payment_intent.invoice,
      email: data.email,
      customerId: subscription.latest_invoice.payment_intent.customer,
      subscriptionId: subscription.id,
    };
    await billingHistory.build(txData).save();
    const getData = await getchatBotUrl(data.websiteId);
    console.log(getData, "--get-");
    data["url"] = getData?.url ? getData?.url : "";
    if (customer && customer.email) {
      data["email"] = customer.email;
      let contentByLang: any = {};
      let footerContent: any = {};
      if (data.languageType === "ja") {
        contentByLang = updateSubscriptionJPObj;
        footerContent = footerContentJP;
      } else {
        contentByLang = updateSubscriptionObj;
        footerContent = footerContentEN;
      }
      await sendMailToUser(data, user, contentByLang, footerContent);
    }
    console.log(data, "---data");
    return data;
  } else {
    return "Subscription Not found";
  }
};

export const getCardList = async (user: any) => {
  let cardArr: any = [];
  const userData = await cards.findAll({
    raw: true,
    where: {
      userId: user.id,
    },
  });
  if (userData && userData.length > 0) {
    cardArr = userData;
    for (let i = 0; i < userData.data.length; i++) {
      const element = userData.data[i];
      let cardsData = {
        cardName: element.billing_details.name,
        last4: element.card.last4,
        exp_month: element.card.exp_month,
        exp_year: element.card.exp_year,
        cardBrand: element.card.brand,
      };
      cardArr.push(cardsData);
    }
    return cardArr;
  } else {
    return cardArr;
  }
};

export const checkExpStatus = async (data: any) => {
  return await billing.findOne({
    raw: true,
    where: {
      websiteId: data.websiteId,
      sericeStatus: false,
    },
  });
};

export const downloadFile = async (data: any) => {
  console.log(data, "--data");

  // const invoicesResponse = await stripe.invoices.list({
  //   customer: "cus_NaI22IWZkC1TKS",
  // });
  const invoices = await stripe.invoices.list({
    subscription: "sub_1MqDqjIifGdcmTlmDUialoNA",
  });
  console.log(invoices, "---invoicesResponse");
  return invoices;
};

export const getSerStatus = async (websiteId: string) => {
  return await billing.findOne({
    raw: true,
    where: {
      websiteId: websiteId,
      active: true,
      // sericeStatus: true,
    },
  });
};
export const getSerStatusList = async (websiteId: string) => {
  return await billing.findOne({
    raw: true,
    where: {
      websiteId: websiteId,
      active: true,
      sericeStatus: true,
    },
  });
};

export const findUserSubToStripe = async (data: any) => {
  const userData = await billing.findOne({
    where: {
      userId: data.userId,
      websiteId: data.websiteId,
      active: true,
      sericeStatus: true,
    },
    raw: true,
  });
  if (userData) {
    const subscription = await stripe.subscriptions.retrieve(
      userData.subscriptionId
    );
    return subscription;
  } else {
    return "Data not found";
  }
};

export const userPayStatus = async (data: any, user: any) => {
  const subscription = await findUserSubToStripe(data);
  console.log(subscription, "---subscription");
  // console.log(user, "---user");
  // active
  if (subscription && subscription.status == "succeeded") {
    const planData = await getPlanInfo(subscription.plan.id);
    const customer = await stripe.customers.retrieve(subscription.customer);

    console.log(customer, "--planData");
    let details = {
      // websiteId: data.websiteId,
      // subscriptionId: subscription.id,
      priceId: data.priceId,
      amount: planData.amount,
      priceSourceKey: planData.id,
      startTime: subscription.current_period_start,
      endTime: subscription.current_period_end,
      sericeStatus: true,
    };

    await billing.update(details, {
      raw: true,
      where: {
        userId: data.userId,
        websiteId: data.websiteId,
        active: true,
        sericeStatus: true,
      },
    });
    const getData = await getchatBotUrl(data.websiteId);
    // console.log(getData, "--get-");
    data["url"] = getData?.url ? getData?.url : "";

    let txData = {
      userId: user.id,
      websiteId: data.websiteId,
      created: subscription.created,
      status: subscription.status,
      amount: Number(planData.amount),
      invoiceId: subscription.latest_invoice,
      email: data.email,
      customerId: subscription.customer,
      subscriptionId: subscription.id,
      invoiceUrl: "",
    };
    if (subscription.status === "active") {
      const invoice = await stripe.invoices.retrieve(
        subscription.latest_invoice
      );
      console.log(invoice.charge, "----invoice");
      const charge = await stripe.charges.retrieve(invoice.charge);
      console.log(charge, "--charge");
      let tampUrl = charge.receipt_url
        .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
        .split("/")[3];
      let isToken = tampUrl.split("?")[0];
      txData[
        "invoiceUrl"
      ] = `${process.env.INVOICE_RECEIPTS_URL}${isToken}/pdf?s=em`;
    }
    await billingHistory.update(txData, {
      raw: true,
      where: {
        userId: data.userId,
        websiteId: data.websiteId,
        active: true,
      },
    });
    if (customer && customer.email) {
      data["email"] = customer.email;
      let contentByLang: any = {};
      if (data.languageType === "ja") {
        contentByLang = proPlanMailContentJP;
      } else {
        contentByLang = proPlanMailContent;
      }
      // await sendMailToUser(data, user, contentByLang, footerContent);
      await sendProPlanMailToUser(data, contentByLang, user);
    }
    console.log(data, "---data");
    return "Done";
  } else {
    return "Data not updated";
  }
};

export const billingList = async (user: any) => {
  let txData: any = [];
  const historyList = await billingHistory.findAll({
    where: {
      userId: user.id,
    },
    order: [["id", "DESC"]],
    raw: true,
  });
  if (historyList && historyList.length > 0) {
    for (let index = 0; index < historyList.length; index++) {
      const element = historyList[index];
      txData.push({
        created: element.created,
        status: element.status,
        amount: element.amount,
        id: element.invoiceId,
        email: element.email,
        websiteId: element.websiteId,
        link: element.invoiceUrl,
      });
    }
    return txData;
  } else {
    return txData;
  }
};

export const deleteWebsiteAndSubsciption = async (
  user: any,
  websiteId: string
) => {
  try {
    const userData = await billing.findOne({
      where: {
        userId: user.id,
        websiteId: websiteId,
      },
      raw: true,
    });
    if (userData) {
      const deleted = await stripe.subscriptions.del(userData.subscriptionId);
      console.log(deleted);
      await billing.update(
        {
          active: false,
          sericeStatus: false,
        },
        {
          where: {
            userId: user.id,
            websiteId: websiteId,
          },
          raw: true,
        }
      );
      await billingHistory.update(
        {
          active: false,
          status: "canceled",
        },
        {
          where: {
            userId: user.id,
            websiteId: websiteId,
          },
          raw: true,
        }
      );
      return {
        status: 200,
        msg: UPDATE_DATA,
      };
    } else {
      return { status: 404, msg: DATA_NOT_FOUND };
    }
  } catch (error) {
    console.log(error, "-248--error");
    return { status: 400, msg: ERROR_OCCURS };
  }
};

export const linkCreate = async (data: any, user: any) => {
  // const createCustomer = await stripe.customers.create({
  //   email: "shanti.chouhan@noborderz.com",
  //   description: "Create subscription trial",
  // });
  const setupIntent2 = await stripe.setupIntents.create({
    customer: "{{CUSTOMER_ID}}",
    payment_method_types: ["bancontact", "card", "ideal"],
  });
  // console.log(createCustomer,'--createCustomer');

  console.log(setupIntent2, "--setupIntent2");

  const custome1r = await stripe.customers.create({
    email: "shanti.chouhan@noborderz.com",
    description: "Create subscription trial",
    payment_method: data.paymentMethod,
  });

  // List the customer's payment methods to find one to charge
  const paymentMethods = await stripe.paymentMethods.list({
    customer: custome1r.id,
    type: "card",
  });
  console.log(paymentMethods, "--paymentMethods");

  return;
  console.log(data, "---");

  // const token = await stripe.tokens.create({
  //   card: {
  //     number: data.cardNumber,
  //     exp_month: data.expMonth,
  //     exp_year: data.expYear,
  //     cvc: data.cvcNumber,
  //   },
  // });
  // const charge = await stripe.charges.create({
  //   amount: 1,
  //   currency: "usd",
  //   source: token.id,
  //   description:
  //     "My First Test Charge (created for API docs at https://www.stripe.com/docs/api)",
  //   payment_method_details: {
  //     card: {
  //       three_d_secure: {
  //         result: "authenticated",
  //       },
  //     },
  //   },
  // });
  // console.log(charge, "--charge");

  // const createCustomer = await stripe.customers.create({
  //   email: "shanti.chouhan@noborderz.com",
  //   description: "Create subscription trial",
  // });
  // console.log(createCustomer, "--createCustomer");
  // const price = await stripe.prices.create({
  //   unit_amount: Math.round(1 * 100),
  //   recurring: { interval: "month" },
  //   currency: "INR",
  //   product: "prod_Ni7a9ySj6N1hwV",
  // });

  // console.log(price, "---price");

  // price_1MyuxCSDxTopkvlZT8wI2HBn

  const customer = await stripe.customers.create({
    email: data.email,
    description: "Donation customer",
    payment_method: data.stripeToken,
    invoice_settings: {
      default_payment_method: data.stripeToken,
    },
  });
  console.log(customer, "---customer");

  const setupIntent = await stripe.setupIntents.create({
    customer: "customer",
    payment_method_types: ["card"],
    payment_method_options: {
      card: {
        mandate_options: {
          // reference: '{{REFRENCE}}',
          description: "check",
          amount: 2,
          currency: "inr",
          amount_type: "fixed",
          // start_date: 1672549767,
          // end_date: 1685592567,
          interval: "month",
          interval_count: 1,
        },
      },
    },
    usage: "off_session",
  });
  console.log(setupIntent, "---setupIntent");

  return;

  const subscribe = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: "price_1MyuxCSDxTopkvlZT8wI2HBn" }],
    expand: ["latest_invoice.payment_intent"],
  });

  return {
    clientSecret: subscribe.latest_invoice.payment_intent.client_secret,
    id: subscribe.latest_invoice.payment_intent.id,
  };
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer: "cus_NkPgtMC5y7vXhH",
    success_url: "https://test-gpt.xanagpt.com/",
    cancel_url: "https://test-gpt.xanagpt.com/",
    billing_address_collection: data.address ? "required" : "auto",
    // line_items: [
    //   {
    //     price: '',
    //     quantity: 1,
    //     tax_rates: [
    //       customer.metadata.country === 'india'
    //     ]
    //   }
    // ]
    line_items: [{ price: "price_1Mwhc6SDxTopkvlZ0K54WBHB", quantity: 1 }],
  });
  console.log(session, "---session");

  return session;
};

export const clientSecret = async (data: any, user: any) => {
  console.log(user, "---user");
  let paymentIntent:any={};
  let customerKey: string = "";
  const userData = await billing.findOne({
    where: {
      userId: user.id,
      active: true,
      sericeStatus: true,
    },
    raw: true,
  });

  // const userData = user;
  console.log(userData, "--userData");
  if (userData) {
    const customer = await stripe.customers.update(userData.customerId, {
      email: data.email,
      name: user.firstName,
      shipping: {
        name: data.name,
        address: {
          line1: data.line1,
          postal_code: data.postalCode,
          city: data.city,
          state: data.state,
          country: data.country,
        },
      },
    });
    customerKey = customer.id;
  } else {
    const customer = await stripe.customers.create({
      email: data.email,
      name: user.firstName,
      shipping: {
        name: data.name,
        address: {
          line1: data.line1,
          postal_code: data.postalCode,
          city: data.city,
          state: data.state,
          country: data.country,
        },
      },
    });

    customerKey = customer.id;
    let details = {
      websiteId: data.websiteId,
      customerId: customerKey,
      userId: user.id,
      sericeStatus: true,
      active: true,
    };
    await billing.build(details).save();
  }
  // for india
// if(data.country==='IN'){
//    paymentIntent = await stripe.paymentIntents.create({
//     amount: 1 * 100,
//     currency: "inr",
//     customer: customerKey,
//     setup_future_usage: "off_session",
//     automatic_payment_methods: { enabled: true },
//   });
// }else{
// for US user
paymentIntent = await stripe.paymentIntents.create({
  amount: 1 * 100,
  currency: "usd",
  customer: customerKey,
  setup_future_usage: "off_session",
  automatic_payment_methods: { enabled: true },
});
// }


  console.log(paymentIntent, "---paymentIntent");

  return paymentIntent;
};



export const newLinkCall = async (data: any, user: any) => {
  console.log(user, "---user");
  const userData = await billing.findOne({
    where: {
      userId: user.id,
      // websiteId: data.websiteId,
      active: true,
      sericeStatus: true,
    },
    raw: true,
  });
  console.log(userData, "---userData");
  // const userData = user;
  // price: "price_1MyuxCSDxTopkvlZT8wI2HBn"
  // let paymentMethod = await stripe.paymentMethods.create({
  //   type: "card",
  //   card: {
  //     // number: 4015611008223686,
  //     // exp_month: 6,
  //     // exp_year: 2027,
  //     // cvc: "745",
  //     number: data.cardNumber,
  //     exp_month: data.expMonth,
  //     exp_year: data.expYear,
  //     cvc: data.cvcNumber,
  //   },
  // });

  // const customer = await stripe.customers.create({
  //   email: data.email,
  //   name: data.name,
  //   //   description: "for amazon-clone project",
  //   // setup_future_usage: true,
  //   // automatic_payment_methods: { enabled: true },
  //   payment_method: paymentMethod.id,
  //   invoice_settings: {
  //     default_payment_method: paymentMethod.id,
  //   },
  //   shipping: {
  //     // name: "jack",
  //     address: {
  //       // line1: "Postmaster, Post Office Paliya",
  //       // postal_code: "453111",
  //       // city: "Indore",
  //       // state: "MP",
  //       // country: "IN",
  //       line1: data.address,
  //       postal_code: data.postalCode,
  //       city: data.City,
  //       state: data.state,
  //       country: data.country,
  //     },
  //   },
  // });

  // const updateCustomer = await stripe.customers.update("cus_NkoGgnxHnbL3An", {
  //   // payment_method: paymentMethod.id,
  //   invoice_settings: {
  //     default_payment_method: paymentMethod.id,
  //   },
  // });
  if (userData) {
    // const customer1 = await stripe.customers.retrieve(userData.customerId);
    // console.log(customer1, "---customer1");
    // const paymentMethods1 = await stripe.paymentMethods.list({
    //   customer: userData.customerId,
    // });
    // console.log(paymentMethods1, "---paymentMethods1");

    // const token = await stripe.tokens.create({
    //   card: {
    //     number: data.cardNumber,
    //     exp_month: data.expMonth,
    //     exp_year: data.expYear,
    //     cvc: data.cvcNumber,
    //   },
    // });
    // console.log(token, "---token 719&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    // let customerCard = await stripe.customers.createSource(
    //   userData.customerId,
    //   {
    //     source: token.id,
    //   }
    // );
    // console.log(customerCard, "--customerCard");

    const subscription = await stripe.subscriptions.create({
      customer: user.customerId,
      items: [
        {
          price: data.priceId,
        },
      ],
      payment_behavior: "default_incomplete",
      // default_payment_method:{
      //   default_source:paymentMethods1.data[0].id
      // },
      // default_source: paymentMethods1.data[0].id,
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    
    console.log(subscription, "--subscription1");
    const planData = await getPlanInfo(data.priceId);
    let details = {
      websiteId: data.websiteId,
      subscriptionId: subscription.id,
      priceId: data.priceId,
      amount: planData.amount,
      priceSourceKey: planData.id,
      startTime: subscription.current_period_start,
      endTime: subscription.current_period_end,
      sericeStatus: true,
      active: true,
    };
    await billing.update(details, {
      raw: true,
      where: {
        userId: user.id,
        websiteId: data.websiteId,
      },
    });
    let txData = {
      userId: user.id,
      websiteId: data.websiteId,
      created: subscription.created,
      status: subscription.latest_invoice.payment_intent.status,
      amount: Number(subscription.latest_invoice.payment_intent.amount) / 100,
      invoiceId: subscription.latest_invoice.payment_intent.invoice,
      email: data.email,
      customerId: subscription.latest_invoice.payment_intent.customer,
      subscriptionId: subscription.id,
      active: true,
    };
    await billingHistory.build(txData).save();
    return {
      data: {
        url: subscription.latest_invoice.hosted_invoice_url,
      },
      code: 200,
      success: true,
      msg: UPDATE_DATA,
    };
  } else {
    return { data: null, code: 404, success: false, mag: NOTFOUND };
  }
};
