const Models = require("../../models");
// const sequelize = require("sequelize");
const chatbotBehavior = Models.chatbotBehavior;
const chatbotAppearance = Models.appearances;
const messages = Models.messages;
const qaCsvFiles = Models.qaCsvFiles;

export const saveChatboxBehavior = async (data: any) => {
  const result = await chatbotBehavior.build(data).save();
  return result;
};

export const updateChatboxBehavior = async (data: any, id: number) => {
  return await chatbotBehavior.update(data, {
    where: {
      websiteId: data.websiteId,
      userId: id,
    },
  });
};

export const saveChatboxApper = async (data: any) => {
  await chatbotAppearance.build(data).save();
  const getData = await chatbotAppearance.findOne({
    raw: true,
    where: {
      websiteId: data.websiteId,
    },
  });
  return getData;
};

export const updateChatboxApper = async (data: any, id: number) => {
  await chatbotAppearance.update(data, {
    where: {
      websiteId: data.websiteId,
      userId: id,
    },
  });
  const getData = await chatbotAppearance.findOne({
    raw: true,
    where: {
      websiteId: data.websiteId,
      userId: id,
    },
  });
  return getData;
};

export const getChatboxApper = async (websiteId: string) => {
  return await chatbotAppearance.findOne({
    raw: true,
    where: {
      websiteId: websiteId,
    },
  });
};

// save bluk Q/A
export const customQueAns = async (data: any) => {
  const result = await messages.bulkCreate(data);
  return result;
};

export const getSingleMsg = async (question: string, user: any) => {
  // replace(/[^a-zA-Z ]/g, "")
  let search = question.replace(/[^a-zA-Z ]/g, "");
  console.log(search, "--search");

  const resultData = await messages.findAll({
    where: {
      websiteId: user.GENESIS_ID,
      userId: user.USER_ID,
    },
    raw: true,
  });
  console.log(resultData.length, "---redd");
  for (let index = 0; index < resultData.length; index++) {
    const element = resultData[index];
    if (element.question.toLowerCase().includes(search.toLocaleLowerCase())) {
      return new Promise((res) => {
        setTimeout(() => {
          console.log("return message");
          res(element);
        }, 5000);
      });
    }
  }
};

export const getMsgList = async (websiteId: string) => {
  const result = await messages.findAll({
    raw: true,
    where: {
      websiteId: websiteId,
    },
    order: [["id", "DESC"]],
  });
  return result;
};

export const updateMsg = async (data: any) => {
  return await messages.update(data, {
    where: {
      messageId: data.messageId,
    },
  });
};

export const removeMsg = async (messageId: string, user: any) => {
  console.log(user, "--user");

  return await messages.destroy({
    where: {
      messageId: messageId,
      userId: user.id,
    },
  });
};

export const getFileByUser = async (userId: number, websiteId: string) => {
  const result = await qaCsvFiles.findOne({
    raw: true,
    where: {
      userId:userId,
      websiteId: websiteId,
      active:true
    },
    attributes: ["id", "userId", "websiteId", "fileLink","fileName","fileSize"],
    order: [["updatedAt", "DESC"]],
  });
  return result;
};

export const saveFileByUser = async (data: any) => {
  return await qaCsvFiles.build(data).save();
};

export const updateFileByUser = async (data: any) => {
  return await qaCsvFiles.update(data.fileLink, {
    where: {
      websiteId: data.websiteId,
      userId:data.userId
    },
  });
};


export const removeFileByUser = async (data:any) => {
  return await qaCsvFiles.update({active:false}, {
    where: {
      websiteId: data.websiteId,
      userId:data.userId
    },
  });
};