import {
  createPLan,
  getList,
  removePlan,
  updatePLan,
} from "../../services/plan-services/plan";
import { verifyUserJwtToken } from "../../services/user-services/auth.service";
import {
  ADD_PLAN,
  DATA_NOT_FOUND,
  ERROR_OCCURS,
  FIND_DATA,
  INVALID_TOKEN,
  NOT_UPDATED,
  REMOVE_DATA,
  SERVER_ERROR,
  UNAUTHORIZED,
  UPDATE_DATA,
} from "../../utils/constants";

/**
 * @api {post} /plan/add-plan   add plan
 * @apiName add plan
 * @apiGroup plan
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  plan Service..
 */
export const addPlan = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        //   req.body["userId"] = checkValidUser.id;
        const result = await createPLan(req.body);
        return reply.code(200).send({
          success: true,
          data: result,
          msg: ADD_PLAN,
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
    console.log(error,'--error');
    
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {get} /plan/get-plan   get plan
 * @apiName get plan
 * @apiGroup plan
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  plan Service..
 */
export const getPlanList = async (req: any, reply: any) => {
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
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {post} /plan/update-plan   get plan
 * @apiName Update plan
 * @apiGroup Plan
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  plan Service..
 */
export const updatePlanById = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        const result = await updatePLan(req.body);
        if (result == 1) {
          return reply.code(200).send({
            success: true,
            data: null,
            msg: UPDATE_DATA,
          });
        } else {
          return reply.code(400).send({
            success: true,
            data: null,
            msg: NOT_UPDATED,
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
    console.log(error, "--error");

    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};

/**
 * @api {delete} /plan/delete-plan   get plan
 * @apiName Delete plan
 * @apiGroup plan
 * @apiHeader {String} Authorization Users unique access-key.
 * @apiDescription  plan Service..
 */
export const deletePlanById = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      const checkValidUser = await verifyUserJwtToken(token);
      if (checkValidUser && checkValidUser.id) {
        const result = await removePlan(req.params.planId);
        if (result == 1) {
          return reply.code(200).send({
            success: true,
            data: result,
            msg: REMOVE_DATA,
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
  } catch (error) {
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};
