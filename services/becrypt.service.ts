// const bcrypt = require('bcrypt');
// export const generateBcryptPassword = (password: string) => {
//     const salt = bcrypt.genSaltSync();
//     const hash = bcrypt.hashSync(password, salt);

//     return hash;
// };

// export const comparePassword = (pw: any, hash: any) => (
//     bcrypt.compareSync(pw, hash)
// );

import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
const salt = genSaltSync(10);

export const generateBcryptPassword = (password:string) => {
  return hashSync(password, salt);
};

export const comparePassword = (password:string, comparePassword:string) => {
  return compareSync(password, comparePassword);
};