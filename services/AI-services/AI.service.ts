import axios from "axios";
import moment from "moment";
import { config } from "../../config";
const Models = require("../../models");
const lockAiCustomerCounts = Models.lockAiCustomerCounts;

// add/update bluk Q/A in AI
export const customQueAnsAI = async (data: any, list: any, user: any) => {
  try {
    console.log("data--", data);

    let payload = {
      method: "get",
      url: `${config.aiBaseApiUrl}/en/update_owner_question/?owner_id=${
        user.id
      }&web_id=${data[0].websiteId}&updated_data=${JSON.stringify(
        list
      )}&action=add&bot_name=${config.aiModalName}`,
      headers: {
        accept: "application/json",
      },
    };
    const response = await axios(payload);
    console.log(response.status, "--ad");

    if (response && response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error, "-----------24");
    return false;
  }
};

// get bluk Q/A in AI
export const getCustomQueAnsAI = async (websiteId: string, userId: number) => {
  try {
    let payload = {
      method: "get",
      url: `${config.aiBaseApiUrl}/en/update_owner_question/?owner_id=${userId}&web_id=${websiteId}&updated_data=display&action=show&bot_name=${config.aiModalName}`,
      headers: {
        accept: "application/json",
      },
    };
    const response = await axios(payload);
    console.log(response, "---response");

    if (response && response.status === 200) {
      return JSON.parse(response.data.response);
    } else {
      return false;
    }
  } catch (error) {
    console.log(error, "-----------24");
    return false;
  }
};

// delete bluk Q/A in AI
export const deleteCustomQueAnsAI = async (data: any, userId: any) => {
  try {
    const list = {
      question: data.question,
    };
    let payload = {
      method: "get",
      url: `${
        config.aiBaseApiUrl
      }/en/update_owner_question/?owner_id=${userId}&web_id=${
        data.websiteId
      }&updated_data=${JSON.stringify(list)}&action=delete&bot_name=${
        config.aiModalName
      }`,
      headers: {
        accept: "application/json",
      },
    };
    const resp: any = await axios(payload);
    console.log(resp, "---");

    if (resp && resp.status === 200) {
      return resp.data.response;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error, "-----------24");
    return false;
  }
};

export const saveAiApiCount = async (data: any) => {
  try {
    let payload = {};
    const CurrentDate =  moment().format("YYYY-MM-DD");
    console.log(CurrentDate,'--------CurrentDate');
    const res = await lockAiCustomerCounts.findOne({
      raw: true,
      where: {
        userId:data.USER_ID,
        websiteId: data.GENESIS_ID,
        date: CurrentDate,
      },
    });
    if (res) {
      payload = {
        aiCount: res['aiCount'] + 1,
      };      
      await lockAiCustomerCounts.update(payload, {
        raw: true,
        where: {
          id: res.id,
        },
      });
    } else {      
      payload = {
        userId: data.USER_ID,
        websiteId: data.GENESIS_ID,
        date: CurrentDate,
        aiCount:1,
      };
      await lockAiCustomerCounts.build(payload).save();
    }
    return "done";
  } catch (error) {
    console.log(error,'------count error----');   
    throw error;
  }
};


export const saveAndUpdateUserToken = async (data: any) => {
  try {
    console.log(data,'---data');
    
    let payload={};
    const CurrentDate =  moment().format("YYYY-MM-DD");
    const result=await lockAiCustomerCounts.findOne({
      where:{
        userId:+data.USER_ID
      }
    })
    console.log(result,'---result');
    
    if (!result) {
      payload = {
        userId: data.USER_ID,
        websiteId: data.GENESIS_ID,
        date: CurrentDate,
        aiCount:data.aiTokensValue,
      };
      await lockAiCustomerCounts.build(payload).save();
    }else{
      payload = {
        aiCount: result['aiCount'] + data.aiTokensValue,
      };      
      await lockAiCustomerCounts.update(payload, {
        raw: true,
        where: {
          id: result.id,
        },
      });
    }
    
    return "done";
  } catch (error) {
    console.log(error,'------count error----');   
    throw error;
  }
};