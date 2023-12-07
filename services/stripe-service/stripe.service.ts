const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const currencyCode = process.env.CURRENCY;
const timeInterval = process.env.INTERVAL;
// plan
export const createPlanWithSripe = async (data: any) => {
  const plan = await stripe.plans.create({
    nickname: data.name,
    amount: data.amount,
    currency: `${currencyCode}`,
    interval: `${timeInterval}`,
    product: `${data.productId}`,
  });
  return plan;
};

export const getPlanById = async (planId: string) => {
  const plan = await stripe.plans.retrieve(planId);
  return plan;
};

export const getAllPlan = async (productId: string) => {
  const plans = await stripe.plans.list({ product: `${productId}` });
  return plans;
};

// subscription

export const createSubscriptionsOfUser = async () => {
  const customer = await stripe.customers.create({
    description:
      "My First Test Customer (created for API docs at https://www.stripe.com/docs/api)",
  });
  console.log(customer, "--customer");
};

// price with product
export const addPayPrice = async (data: any) => {
  const price = await stripe.prices.create({
    nickname: data.name,
    unit_amount: data.amount * 100,
    currency: currencyCode,
    recurring: { interval: timeInterval },
    product: data.productId,
  });
  return price;
};

export const getPrice = async (data: any) => {
  const prices = await stripe.prices.list({
    product: data.productId,
  });
  return prices;
};
