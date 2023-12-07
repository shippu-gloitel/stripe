module.exports = (sequelize: any, DataTypes: any) => {
    const appearances = sequelize.define('appearances', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        websiteId:{ type: DataTypes.STRING, allowNull: true, default: null },
        colorName:{type: DataTypes.STRING,allowNull: true, default: null},
        colorCode:{type: DataTypes.STRING,allowNull: true, default: null},
        text:{type: DataTypes.STRING,allowNull: true, default: null},
        welcomeMsg: { type: DataTypes.STRING,allowNull: true, default: null},
        background: { type: DataTypes.STRING,allowNull: true, default: null},
        backgroundImage: { type: DataTypes.STRING,allowNull: true, default: null},
        position: { type: DataTypes.BOOLEAN,allowNull: true, default: false},
        language:{ type: DataTypes.STRING,allowNull: true, default: null},
        voiceEnable:{ type: DataTypes.BOOLEAN,allowNull: true, default: false},
    }, {});

    return appearances;
};


