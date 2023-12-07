module.exports = (sequelize: any, DataTypes: any) => {
    const websites = sequelize.define('websites', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        websiteId:{ type: DataTypes.STRING, allowNull: true, defaultValue: null },
        name: { type: DataTypes.STRING, require:true},
        url: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        icon: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        status: { type: DataTypes.BOOLEAN, defaultValue: true },
        subscriptionStatus: { type: DataTypes.BOOLEAN, defaultValue: true },

    }, {});

    return websites;
};


