import { deletePlanWithId, getProductById, updatePlanByUseId } from "../product-services/productServices";
import { createPlanWithSripe, getAllPlan } from "../stripe-service/stripe.service";

const Models = require("../../models");
const plans = Models.plans;

export const createPLan = async (data: any) => {
  // const productResult: any = await getProductById();  
  const planRes = await createPlanWithSripe(data);
  console.log(planRes,'--planRes');
  
  data["stripePlanId"] = planRes.id;
  data["planName"]=planRes.nickname
  const result = await plans.build(data).save();
  console.log(result,'-result');
  
  return result;
};

export const getList = async () => {
  const productResult: any = await getProductById();  
  const plans=await getAllPlan(productResult.id);  
  return plans.data;
};

export const updatePLan = async (data: any) => {
  // return await plans.update(data, { where: { id: data.id } });
  return await updatePlanByUseId(data)
};

export const removePlan = async (planId: string) => {
  // return await plans.destroy({
  //   where: { id: planId },
  // });

  return await deletePlanWithId(planId)
};
