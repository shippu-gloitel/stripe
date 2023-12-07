const Models = require("../../models");
const users = Models.users;

export const createUser = async (data: any) => {
  const result = await users.build(data).save();
  return result;
};

export const getUserByEmail = async (email: any) => {
  return await users.findOne({
    where: { email: email },
  });
};

export const getUserByPhone = async (number: any) => {
  return await users.findOne({ where: { phoneNumber: number } });
};

export const updateUserPassword = async (id: number, data: any) => {
  return await users.update(data, { where: { id: id } });
};

export const updateProfile = async (id: any, data: any) => {
  return await users.update(data, { where: { id: id.id } });
};

export const updateWithPhoneProfile = async (id: any, data: any) => {
  return await users.update(data, { where: { phoneNumber: id.phoneNumber } });
};
export const updateWithEmailProfile = async (id: any, data: any) => {
  return await users.update(data, { where: { email: id.email } });
};

export const getUser = async (userId: number) => {
  return await users.findOne({
    raw: true,
    where: { id: userId, isVerified: true, isRegister: true,isDeleted:false },
  });
};

export const getRegisteredUserWithPhone = async (number: any) => {
  return await users.findOne({
    raw: true,
    where: {
      phoneNumber: number,
      isVerified: true,
      isRegister: true,
    },
  });
};

export const getRegisteredUserWithEmail = async (email: any) => {
  return await users.findOne({
    raw: true,
    where: {
      email: email,
      isVerified: true,
      isRegister: true,
    },
  });
};

export const getVerifedRegisteredUserWithEmail = async (email: any) => {
  return await users.findOne({
    raw: true,
    where: {
      email: email,
      isVerified: true,
    },
  });
};

export const getVerifedRegisteredUserWithPhone = async (number: any) => {
  return await users.findOne({
    raw: true,
    where: {
      phoneNumber: number,
      isVerified: true,
    },
  });
};

export const deleteUser = async (id: number) => {
  return await users.update({ isDeleted: true }, { where: { id: id } });
};

export const findUserIsExist = async (value: string) => {
  if (value.includes("@")) {
    return await users.findOne({
      raw: true,
      where: { email: value },
    });
  } else {
    return await users.findOne({
      raw: true,
      where: { phoneNumber: value },
    });
  }
};

export const updateUserCustomerId = async (data: string, id: number) => {
  return await users.update({ customerId: data }, { where: { id: id } });
};
