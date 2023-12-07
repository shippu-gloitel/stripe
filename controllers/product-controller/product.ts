import { verifyJwtToken } from "../../services/user-services/auth.service";
import {
  createProduct,
  getList,
  // getProducts,
} from "../../services/product-services/productServices";
import {
  ADDED_PRODUCT,
  DATA_NOT_FOUND,
  ERROR_OCCURS,
  FIND_DATA,
  INVALID_TOKEN,
  SERVER_ERROR,
  UNAUTHORIZED,
} from "../../utils/constants";

/**
* @api {post} /product/add-product   Save product 
* @apiName Add Product 
* @apiGroup Product
* @apiDescription  Product Service..
*/
export const addProduct = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      verifyJwtToken(token, async function (error: any, decoded: any) {
        if (error) {
          return reply.code(403).send({
            success: false,
            data: error,
            msg: INVALID_TOKEN,
          });
        } else {
          req.body["userId"] = decoded.id;
          let productRes = await createProduct(req.body);
          console.log(productRes,"--websiteRes");
          
          if (productRes) {
            return reply.code(200).send({
              success: true,
              data: null,
              msg: ADDED_PRODUCT,
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
* @api {get} /product/get-product-list   get product 
* @apiName Get Product 
* @apiGroup Product
* @apiDescription  Product Service..
*/
export const getProductList = async (req: any, reply: any) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      verifyJwtToken(token, async function (error: any, decoded: any) {
        if (error) {
          return reply.code(403).send({
            success: false,
            data: error,
            msg: INVALID_TOKEN,
          });
        } else {
          let websiteRes = await getList();
          // let websiteRes = await getProducts();
          console.log(websiteRes,'--websiteRes');
          
          if (websiteRes && websiteRes.data.length > 0) {
            return reply.code(200).send({
              success: true,
              data: websiteRes.data,
              msg: FIND_DATA,
            });
          } else
            return reply.code(400).send({
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
    console.log(error);
    
    return reply.code(500).send({
      success: false,
      data: error,
      msg: SERVER_ERROR,
    });
  }
};