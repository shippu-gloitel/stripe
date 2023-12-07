
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const createSubscription=async()=>{
console.log(stripe)
}