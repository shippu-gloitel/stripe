const Models = require("../../models");
const messages = Models.messages;
const conversations = Models.conversations;
const messageRecipient = Models.messageRecipient;
const { Op } = require("sequelize");

export const createMsg = async (data: any) => {
  return await messages.create(data);
};

export const createConversation = async (data: any) => {
  return await conversations.create(data);
};

export const findConversation = async (
  senderId: any,
  receiverId: any,
  receivedGroupId: any
) => {
  let whereClause: any = {};
  if (receivedGroupId)
    whereClause = { receivedGroupId: receivedGroupId, isDeleted: false };
  else
    whereClause = {
      [Op.or]: {
        [Op.and]: [
          { senderId: senderId },
          { receiverId: receiverId },
          { isDeleted: false },
        ],
        [Op.or]: {
          [Op.and]: [
            { senderId: receiverId },
            { receiverId: senderId },
            { isDeleted: false },
          ],
        },
      },
    };
  return await conversations.findOne({
    where: whereClause,
    include: [
      {
        required: false,
      },
    ],
  });
};

export const updateConversation = async (data: any, id: number) => {
  return await conversations.update(data, { where: { id: id } });
};

export const createMessageRecipients = async (data: any) => {
  return await messageRecipient.create(data);
};
export const saveBotMsg = async (data: any) => {
  const result = await messages.build(data).save();
  console.log(result, "---");
};
