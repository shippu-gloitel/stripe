const Models = require("../../models");
const product = Models.products;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const createProduct = async (data: any) => {
  const productObject = await stripe.products.create({
    name: `${data.name}`,
  });
  data["productId"] = productObject.id;
  const result = await product.build(data).save();
  return result;
};

export const getList = async () => {
  return await stripe.products.list({ limit: 3 });
};

export const getProductById = async () => {
  const result = await product.findOne({ raw: true });
  return await stripe.products.retrieve(result.productId);
};

export const updatePlanByUseId = async (data: any) => {
  const plan = await stripe.plans.update(data.planId, {
    metadata:data,
  });
  return plan;
};

export const getProducts = async () => {
 return await product.find({ raw: true });
};

export const deletePlanWithId=async(planId:string)=>{
  const deleted = await stripe.plans.del(
    planId
  );
  return deleted
}