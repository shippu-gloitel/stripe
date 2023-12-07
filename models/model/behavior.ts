module.exports = (sequelize: any, DataTypes: any) => {
    const chatbotBehavior = sequelize.define('chatbotBehavior', {
        userId:{ type: DataTypes.STRING, allowNull: true, defaultValue: null },
        websiteId:{ type: DataTypes.STRING, allowNull: true, defaultValue: null },
        lastActive:{ type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
        showOpertorFace:{ type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false},
        showReplyTime: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
        hideChatbot: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
        hideOnMobile:{ type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
        askEmail: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    }, {});

    return chatbotBehavior;
};


