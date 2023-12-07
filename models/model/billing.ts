module.exports = (sequelize: any, DataTypes: any) => {
    const websites = sequelize.define('billing', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        paymentMethodId: { type: DataTypes.STRING, require:true},
        websiteId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        customerId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        subscriptionId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        priceId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        amount: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        paymentChargeId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        description: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        priceSourceKey: {type: DataTypes.INTEGER, allowNull: false },
        sessionId:{type: DataTypes.STRING,allowNull: true, default: null},
        startTime:{type: DataTypes.STRING,allowNull: true, default: null},
        endTime:{type: DataTypes.STRING,allowNull: true, default: null},
        createdAt: { type: DataTypes.DATE, defaultValue: null },
        active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
        sericeStatus: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
    }, {});

    return websites;
};


