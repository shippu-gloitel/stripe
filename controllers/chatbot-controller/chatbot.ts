import {
  customQueAns,
  getChatboxApper,
  getFileByUser,
  removeFileByUser,
  // getMsgList,
  removeMsg,
  saveChatboxApper,
  saveChatboxBehavior,
  updateChatboxApper,
  updateChatboxBehavior,
  updateMsg,
} from "../../services/chat-bot-services/chatbot";
import { verifyJwtToken } from "../../services/user-services/auth.service";
import {
  DATA_NOT_FOUND,
  EMAIL_VALIDATION,
  ERROR_OCCURS,
  FIND_DATA,
  INVALID_TOKEN,
  JWT_EXPRIED,
  NOT_UPDATED,
  REMOVE_DATA,
  SAVE_DATA,
  SERVER_ERROR,
  UNAUTHORIZED,
  UPDATE_DATA,
} from "../../utils/constants";
import { v4 as uuidv4 } from "uuid";
import {
  customQueAnsAI,
  deleteCustomQueAnsAI,
  getCustomQueAnsAI,
} from "../../services/AI-services/AI.service";

/**
 * @api {post} /chatbot/chatbox-behavior Chatbox Behavior
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Chatbox Behavior
 * @apiGroup chatbot
 * @apiDescription  chatbot Service..
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
 * @api {post} /chatbot/chatbox-behavior-update Chatbox Behavior
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Chatbox Behavior
 * @apiGroup chatbot
 * @apiDescription  chatbot Service..
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
 * @api {post} /chatbot/chatbox-appearance Chatbox appearance
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Chatbox appearance
 * @apiGroup chatBot
 * @apiDescription  chatBot Service..
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
          req.body["userId"] = decoded.id;
          let websiteRes = await saveChatboxApper(req.body);
          console.log(websiteRes, "---websiteRes");

          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: websiteRes,
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
 * @api {get} /chatbot/get-chatbox-appearance/:websiteId  Get chatBot
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Get chatBot
 * @apiGroup chatBot
 * @apiParam {String}  websiteId  `Mendatory`.
 * @apiDescription  chatBot Service..
 */
export const chatbotAppearanceById = async (req: any, reply: any) => {
  try {
    let websiteRes = await getChatboxApper(req.params.websiteId);
    if (websiteRes) {
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
  } catch (error) {
    console.log(error, "---210");

    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /chatbot/update-chatbox-appearance Chatbox Appearance
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Chatbox Appearance
 * @apiGroup chatbot
 * @apiDescription  chatbot Service..
 */
export const updateChatbotAppearance = async (req: any, reply: any) => {
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
          let websiteRes = await updateChatboxApper(req.body, decoded.id);
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: websiteRes,
              msg: UPDATE_DATA,
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
 * @api {post} /chatbot/save-chatbox-custom Chatbox custom
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Chatbox custom
 * @apiGroup chatbot
 * @apiDescription  chatbot Service..
 */
export const saveChatbotCustom = async (req: any, reply: any) => {
  try {
    let listOfQuestions: any = [];
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
          for (let index = 0; index < req.body.length; index++) {
            const element = req.body[index];
            // let myuuid: any = uuidv4();
            // element["userId"] = decoded.id;
            // element["messageId"] = `msg_${myuuid}`;
            // element["question"] = element.question.trim();
            // element["answer"] = element.answer.trim();
            listOfQuestions.push({
              question: element.question.trim(),
              answer: element.answer.trim(),
            });
          }
          // let websiteRes = await customQueAns(listOfQuestions);
          const websiteRes = await customQueAnsAI(
            req.body,
            listOfQuestions,
            decoded
          );
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: SAVE_DATA,
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
 * @api {get} /chatbot/get-custom-list/:websiteId  Get chatBot
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Get chatBot
 * @apiGroup chatBot
 * @apiParam {String}  websiteId  `Mendatory`.
 * @apiDescription  chatBot Service..
 */
export const getListOfCustom = async (req: any, reply: any) => {
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
          // let result = await getMsgList(req.params.websiteId);
          let result = await getCustomQueAnsAI(
            req.params.websiteId,
            decoded.id
          );
          if (result && result.length > 0) {
            return reply.code(200).send({
              success: true,
              data: result,
              msg: FIND_DATA,
            });
          } else
            return reply.code(200).send({
              success: false,
              data: [],
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
 * @api {post} /chatbot/update-chatbox-custom Chatbox custom
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Chatbox custom
 * @apiGroup chatbot
 * @apiDescription  chatbot Service..
 */
export const updateChatbotCustom = async (req: any, reply: any) => {
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
          console.log("beforrr--", req.body);
          req.body["question"] = req.body.question.trim();
          req.body["answer"] = req.body.answer.trim();
          console.log(req.body, "---req.body");

          let websiteRes = await updateMsg(req.body);
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
 * @api {post} /chatbot/delete-custom/:messageId  Delete Message
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Delete Message
 * @apiGroup Message
 * @apiParam {String}  messageId  `Mendatory`.
 * @apiDescription  chatbot Service..
 */
export const deleteCustomQusAns = async (req: any, reply: any) => {
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
          let websiteRes = await removeMsg(req.params.messageId, decoded);
          console.log(websiteRes, "--websiteRes");

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
 * @api {post} /chatbot/upload-custom-csv csv custom
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName csv custom
 * @apiGroup chatbot
 * @apiDescription  chatbot Service..
 */
export const upladCsvFile = async (req: any, reply: any) => {
  try {
    let listOfQuestions: any = [];
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
            element["messageId"] = `msg_${myuuid}`;
            listOfQuestions.push(element);
          }
          let websiteRes = await customQueAns(listOfQuestions);
          if (websiteRes) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: SAVE_DATA,
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
 * @api {post} /chatbot/delete-custom-QA/:question  Delete question in AI
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiName Delete question
 * @apiGroup question
 * @apiParam {String}  question  `Mendatory`.
 * @apiDescription  chatbot Service..
 */
export const deleteQusAnsInAI = async (req: any, reply: any) => {
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
          // let websiteRes = await removeMsg(req.params.messageId, decoded);
          let websiteRes = await deleteCustomQueAnsAI(req.body, decoded.id);
          console.log(websiteRes, "--websiteRes");
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
 * @api {post} /chatbot/download-QA-csv  Download file
 * @apiName Download file
 * @apiGroup chatbot
 * @apiParam {String}  websiteId  `Mendatory`.
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  chatbot Service..
 */
export const dwonloadCsvFile = async (req: any, reply: any) => {
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
        }
        if (decoded && decoded.id) {
          const findFileResponse = await getFileByUser(
            decoded.id,
            req.body.websiteId
          );
          if (findFileResponse) {
            return reply.code(200).send({
              success: true,
              data: findFileResponse,
              msg: FIND_DATA,
            });
          } else {
            return reply.code(400).send({
              success: false,
              data: null,
              msg: DATA_NOT_FOUND,
            });
          }
        } else {
          return reply.code(404).send({
            success: false,
            data: null,
            msg: EMAIL_VALIDATION,
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
 * @api {get} /chatbot/delete-QA-csv/:websiteId  Delete file
 * @apiName Delete file
 * @apiGroup chatbot
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  chatbot Service..
 */
export const deleteCsvFile = async (req: any, reply: any) => {
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
        }
        if (decoded && decoded.id) {
          let requestData = {
            userId: decoded.id,
            websiteId: req.params.websiteId,
          };
          const findFileResponse = await removeFileByUser(requestData);
          if (findFileResponse) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: REMOVE_DATA,
            });
          } else {
            return reply.code(400).send({
              success: false,
              data: null,
              msg: NOT_UPDATED,
            });
          }
        } else {
          return reply.code(404).send({
            success: false,
            data: null,
            msg: EMAIL_VALIDATION,
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
