import { sendThankyouMailToUser } from "../../helper/mail-service";
import {
  ADDED_WEBSITE,
  CHECK_WEBSITE,
  ERROR_OCCURS,
  UPDATE_DATA,
} from "../../utils/constants";
import { thankyouMailContent } from "../../utils/email-constants";
import { thankyouMailContentJP } from "../../utils/jp-email-constants";
import {
  createFreePlanForUser,
  deleteWebsiteAndSubsciption,
  getPlanBySite,
  getSerStatus,
  getSerStatusList,
} from "../billing-services/billing";
import {
  getChatboxApper,
  saveChatboxApper,
} from "../chat-bot-services/chatbot";
// import { Op } from "sequelize";

const Models = require("../../models");
const websites = Models.websites;
const chatbotBehavior = Models.chatbotBehavior;
// const { Op } = require("sequelize");

export const createWebsite = async (data: any, user: any) => {
  try {
    let isSiteData: any = [];
    const chatBotData = {
      userId: data.userId,
      websiteId: data.websiteId,
      colorName: "Blue",
      colorCode: "#3C7BDE",
      text: "Questions? Chat with us!",
      welcomeMsg: "Hi there, How can I help you today?",
      background: "Houndstooth",
      backgroundImage:
        "https://aydvewoyxq.cloudimg.io/_genesisbe_/1679655916417-houndstooth.svg",
      position: false,
      language: "English",
      voiceEnable: false,
    };
    let isCheck = false;
    const websiteResult = await websites.findAll({
      distinct: true,
      subQuery: false,
      raw: true,
    });
    for (let index = 0; index < websiteResult.length; index++) {
      const element = websiteResult[index];
      let tampUrl1 = element.url
        .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
        .split("/");
      let tampUrl2 = data.url
        .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
        .split("/");
      if (tampUrl1[0].toLowerCase() == tampUrl2[0].toLowerCase()) {
        isSiteData.push(element);
        isCheck = true;
      }
    }
    console.log(isSiteData, "--isSiteData");
    if (isCheck) {
      for (let index = 0; index < isSiteData.length; index++) {
        // status: false, subscriptionStatus: false
        if (isSiteData[index].status && isSiteData[index].subscriptionStatus) {
          return {
            success: false,
            code: 400,
            data: null,
            msg: CHECK_WEBSITE,
          };
        }
      }
      console.log("&&&&&&&&&&&&&&&&check ******88$$$$$$$$$$$$$$$$$$$4");
      await websites.build(data).save();
      await saveChatboxApper(chatBotData);
      return {
        success: true,
        code: 200,
        data: null,
        msg: ADDED_WEBSITE,
      };
    } else {
      const isPlanCreated = await createFreePlanForUser(data, user);
      console.log(isPlanCreated, "---isPlanCreated");
      if (isPlanCreated) {
        await websites.build(data).save();
        if (data && data.email) {
          let contentByLang: any = {};
          // let footerContent: any = {};
          if (data.languageType === "ja") {
            contentByLang = thankyouMailContentJP;
            // footerContent = footerContentJP;
          } else {
            contentByLang = thankyouMailContent;
            // footerContent = footerContentEN;
          }
          // ***********thank you mail to user for free Subscription************
          // await sendMailToUser(data, user, contentByLang, footerContent);
          await sendThankyouMailToUser(data, contentByLang);
        }
        await saveChatboxApper(chatBotData);
        return {
          success: true,
          code: 200,
          data: null,
          msg: ADDED_WEBSITE,
        };
      } else {
        return {
          success: false,
          code: 400,
          data: null,
          msg: ERROR_OCCURS,
        };
      }
    }
  } catch (error) {
    console.log("website error--", error);
    throw error;
  }
};

export const getList = async (userId: number) => {
  let userWebsiteList = [];
  const websiteList = await websites.findAll({
    raw: true,
    where: {
      userId: userId,
      status: true,
    },
    order: [["id", "DESC"]],
  });
  for (let i = 0; i < websiteList.length; i++) {
    const element = websiteList[i];
    const planByWebsite = await getPlanBySite(element);
    userWebsiteList.push({
      website: element,
      plan: planByWebsite,
    });
  }
  return userWebsiteList;
};

export const updateWebsiteByUser = async (id: string, data: any) => {
  let isUrl: any = {};
  if (data && data.url) {
    isUrl = await getWebsiteforUpdate(data.url);
  }
  console.log(isUrl, "---isUrl", "id--");

  if (isUrl && isUrl.id && isUrl.websiteId != id) {
    return {
      status: false,
      code: 400,
      msg: CHECK_WEBSITE,
    };
  } else {
    await websites.update(data, { where: { websiteId: id } });
    return {
      status: true,
      code: 200,
      msg: UPDATE_DATA,
    };
  }
};

export const getWebsite = async (websiteId: string, user: any) => {
  return await websites.findOne({
    raw: true,
    where: {
      websiteId: websiteId,
      status: true,
      userId: user.id,
    },
  });
};

export const removeWebsiteById = async (websiteId: string, user: any) => {
  await websites.update(
    { status: false, subscriptionStatus: false },
    {
      where: {
        websiteId: websiteId,
        userId: user.id,
      },
    }
  );
  return await deleteWebsiteAndSubsciption(user, websiteId);
};

export const insertBulkWebsite = async (data: any) => {
  const result = await websites.bulkCreate(data);
  return result;
};

export const saveChatboxBehavior = async (data: any) => {
  const result = await chatbotBehavior.build(data).save();
  return result;
};

export const updateChatboxBehavior = async (data: any, id: number) => {
  console.log(id, "--");

  return await chatbotBehavior.update(data, {
    where: {
      websiteId: data.websiteId,
    },
  });
};

export const getWebsiteByUrl = async (url: string) => {
  return await websites.findOne({
    raw: true,
    where: {
      url: url,
      status: true,
    },
  });
};

export const getWebsiteforUpdate = async (url: string) => {
  console.log(url, "--");
  let isCheck: any = {};
  let isSiteData: any = [];

  const websiteResult = await websites.findAll({
    distinct: true,
    subQuery: false,
    raw: true,
  });
  for (let index = 0; index < websiteResult.length; index++) {
    const element = websiteResult[index];
    let tampUrl1 = element.url
      .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
      .split("/");
    let tampUrl2 = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/");
    console.log(tampUrl1, "---1", "&&&&&&7", tampUrl2);
    if (tampUrl1[0].toLowerCase() == tampUrl2[0].toLowerCase()) {
      // if (element.subscriptionStatus && element.status) {
      //   // isCheck = element;
      //   isSiteData.push(element);
      // }
      // isCheck = element;
      isSiteData.push(element);
    }
  }

  if (isCheck) {
    for (let index = 0; index < isSiteData.length; index++) {
      // status: false, subscriptionStatus: false
      if (isSiteData[index].status && isSiteData[index].subscriptionStatus) {
        isCheck = isSiteData[index];
      }
    }
  }
  return isCheck;
};

export const getWebsiteByDomain = async (websiteId: string, url: string) => {
  const website = await websites.findOne({
    raw: true,
    where: {
      websiteId: websiteId,
      status: true,
    },
  });
  if (website && website.url.includes(url)) {
    const appData = await getChatboxApper(websiteId);
    return {
      status: true,
      msg: "Domain is correct",
      data: appData,
    };
  } else {
    return {
      status: false,
      msg: "Domain is not match with website id",
      data: null,
    };
  }
};

export const getchatBotUrl = async (websiteId: string) => {
  return await websites.findOne({
    raw: true,
    where: {
      websiteId: `${websiteId}`,
    },
  });
};

export const getStatusList = async (userId: number) => {
  let userWebsiteList = [];
  const websiteList = await websites.findAll({
    raw: true,
    where: {
      userId: userId,
      status: true,
      // subscriptionStatus: true,
    },
    order: [["id", "DESC"]],
  });
  console.log(websiteList, "--websiteList");

  for (let i = 0; i < websiteList.length; i++) {
    const element = websiteList[i];
    const planByWebsite = await getPlanBySite(element);
    const getStatus = await getSerStatusList(element.websiteId);
    userWebsiteList.push({
      website: element,
      plan: planByWebsite,
      paymentStatus: getStatus,
    });
  }
  return userWebsiteList;
};

export const cancelWebsiteSub = async (websiteId: string, user: any) => {
  return await websites.update(
    { subscriptionStatus: false },
    {
      where: {
        websiteId: websiteId,
        userId: user.id,
      },
    }
  );
};

export const getAddedList = async (userId: number) => {
  let userWebsiteList = [];
  const websiteList = await websites.findAll({
    raw: true,
    where: {
      userId: userId,
      status: true,
      // subscriptionStatus: true,
    },
    order: [["id", "DESC"]],
  });
  console.log(websiteList, "--websiteList");

  for (let i = 0; i < websiteList.length; i++) {
    const element = websiteList[i];
    const planByWebsite = await getPlanBySite(element);
    const getStatus = await getSerStatus(element.websiteId);
    userWebsiteList.push({
      website: element,
      plan: planByWebsite,
      paymentStatus: getStatus,
    });
  }
  return userWebsiteList;
};
