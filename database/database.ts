const Sequelize = require('sequelize');
import { config } from '../config';
// import { dbLogger } from './db.logger';
const path = require('path');
import * as fs from 'fs'

const {db : DbConfig} = config;
// const db = new Sequelize(
//     config.db.database,
//     config.db.user,
//     config.db.password, {
//     port: config.db.port,
//     dialect: "postgres",
//     logging: true
// },
// );
const db = new Sequelize(DbConfig)

let modelsPath: string = path.join(__dirname, '../models/model');

export const models: any = {};

function getExtension(path: string) {
    const basename = path.split(/[\\/]/).pop(),  // extract file name from full path ...
        pos = basename!.lastIndexOf(".");       // get last position of `.`
    if (basename === "" || pos < 1)            // if file name is empty or ...
        return "";                             //  `.` not found (-1) or comes first (0)

    return basename!.slice(pos + 1);            // extract extension ignoring `.`
}


fs.readdirSync(modelsPath).forEach((file: any) => {
    if (getExtension(file) === 'js') {
        models[file.replace('.js', '')] = require(`${modelsPath}/${file}`)(db, Sequelize);
    }
    else if (getExtension(file) === 'ts') {
        models[file.replace('.ts', '')] = require(`${modelsPath}/${file}`)(db, Sequelize);
    }
});

export default db;