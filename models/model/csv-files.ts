module.exports = (sequelize: any, DataTypes: any) => {
    const qaCsvFiles = sequelize.define('qaCsvFiles', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        websiteId:{ type: DataTypes.STRING, allowNull: true, defaultValue: null },
        fileLink: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        fileName: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
        fileSize: { type: DataTypes.STRING, allowNull: true, defaultValue: null },

    }, {});

    return qaCsvFiles;
};


