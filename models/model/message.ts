module.exports = (sequelize: any, DataTypes: any) => {
    const messages = sequelize.define('messages', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        websiteId:{type: DataTypes.STRING, allowNull: true,default:null},
        messageId:{type: DataTypes.STRING, allowNull: true,default:null},
        question: { type: DataTypes.TEXT, allowNull: true },
        answer: { type: DataTypes.TEXT, allowNull: true },
        type: { type: DataTypes.STRING, allowNull: true,default:'text' }
    }, {});
    messages.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());
        return values;
    };
    return messages;
};


