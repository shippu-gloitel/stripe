module.exports = (sequelize: any, DataTypes: any) => {
    const messageRecipient = sequelize.define('messageRecipient', {
        receiverId: { type: DataTypes.INTEGER, allowNull: true },
        receivedGroupId: { type: DataTypes.INTEGER, allowNull: true },
        messageId: { type: DataTypes.INTEGER, allowNull: false },
        senderId: { type: DataTypes.INTEGER, allowNull: false }
    }, {});
    messageRecipient.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());
        return values;
    };
    return messageRecipient;
};


