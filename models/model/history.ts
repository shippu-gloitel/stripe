module.exports = (sequelize: any, DataTypes: any) => {
    const websites = sequelize.define('billingHistory', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        websiteId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        created: { type: DataTypes.STRING, defaultValue: null },
        customerId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        subscriptionId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        invoiceId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        email: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        amount: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        status: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
        invoiceUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        createdAt: { type: DataTypes.DATE, defaultValue: null },
       
    }, {});

    return websites;
};


