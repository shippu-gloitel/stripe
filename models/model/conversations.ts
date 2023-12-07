module.exports = (sequelize: any, DataTypes: any) => {
    const conversations = sequelize.define('conversations', {
        receiverId: { type: DataTypes.INTEGER, allowNull: true },
        receivedGroupId: { type: DataTypes.INTEGER, allowNull: true },
        senderId: { type: DataTypes.INTEGER, allowNull: true },
        lastMsg: { type: DataTypes.TEXT, allowNull: true, defaultValue: 0 },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {});
    conversations.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());
        return values;
    };
    return conversations;
};