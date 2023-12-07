import {
  createConversation,
  createMessageRecipients,
  createMsg,
  findConversation,
  updateConversation,
} from "../../services/socket-services/socket";
import {
  SERVER_ERROR,
} from "../../utils/constants";
const globalAny: any = global;

/**
 * @api {post} /socket/create-msg   Save socket
 * @apiName Add socket
 * @apiGroup socket
 * @apiDescription  socket Service..
 */
export const createNewMessage = async (req: any, reply: any) => {
  try {

    // socketId
    globalAny.io.to(req.body.receiverId).emit("broadcast-message", {
      user: req.body.receiverId,
      message: req.body.message,
    });
    return reply.code(200).send({
      success: true,
      data: null,
      msg: "done",
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
 * @api {post} /chat/create-msg  Create Message
 * @apiName Create Message
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiGroup Chat
 * @apiDescription  Chat Service..
 */
export const createMessage = async (req: any, reply: any) => {
  try {
    if (!req.body.receiverId && !req.body.receivedGroupId) {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: "Invalid Request atleast one receiver or receiver group is required",
      });
    }
    if (!req.body.msg && !req.body.attachments) {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: "Invalid Request atleast one message or attachment is required",
      });
    }
    let senderId = req.decoded.id;
    let userIdArray: any = [];

    // checking or creating conversation
    let conversationExistRes = await findConversation(
      senderId,
      req.body.receiverId ? req.body.receiverId : null,
      req.body.receivedGroupId ? req.body.receivedGroupId : null
    );
    if (conversationExistRes) {
      if (
        conversationExistRes.deletedConversations &&
        conversationExistRes.deletedConversations.length > 0
      ) {
        let deletedConversationIds: any = [];
        conversationExistRes.deletedConversations.forEach((element: any) => {
          deletedConversationIds.push(element.id);
        });
        // for (const ids of deletedConversationIds) {
        //     await destroyDeletedConversation(ids);
        // }
      }
      // update convesation
      let updateConversationRes = await updateConversation(
        { lastMsg: req.body.msg ? req.body.msg : "attachments" },
        conversationExistRes.id
      );

      if (updateConversationRes[0] === 1) {
        console.log(`Conversation updated`);
      } else {
        console.log(`Error occurs during conversation updation`);
      }
    } else {
      // add conversation
      let conversationBody: any = {};

      conversationBody["lastMsg"] = req.body.msg ? req.body.msg : "attachments";
      conversationBody["senderId"] = senderId;
      conversationBody["receiverId"] = req.body.receiverId;
      let addConversationRes = await createConversation(conversationBody);

      if (addConversationRes) {
        console.log(`Conversation created`);
        let conversationData: any = [];
        userIdArray.forEach((userId: any) => {
          let obj = {
            conversationId: addConversationRes.id,
            userId: userId,
            unReadCount: 1,
          };
          conversationData.push(obj);
        });
        conversationData.push({
          conversationId: addConversationRes.id,
          userId: senderId,
          unReadCount: 0,
        });
      } else {
        console.log(`Error occurs during conversation creation`);
      }
    }
    // creating message
    let msgCreateRes = await createMsg({
      msg: req.body.msg,
      type: req.body.type ? req.body.type : "Normal",
    });
    if (msgCreateRes) {
      // create messageRecipents
      let msgRecBody: any = {};
      msgRecBody["senderId"] = senderId;
      msgRecBody["messageId"] = msgCreateRes.id;
      msgRecBody["receiverId"] = req.body.receiverId;
      let msgRecipientsRes = await createMessageRecipients(msgRecBody);

      if (msgRecipientsRes) {
        const globalAny: any = global;
        globalAny.io.emit(
          "MessageReceived",
          JSON.stringify({ userList: userIdArray })
        );
        return reply.code(200).send({
          success: true,
          data: msgRecipientsRes,
          msg: "Message created successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          data: null,
          msg: "Error occurs during msg recipients creation",
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        data: null,
        msg: "Error occurs during msg creation",
      });
    }
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, data: error, msg: "Internal server error" });
  }
};
