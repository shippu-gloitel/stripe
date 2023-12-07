module.exports = (sequelize: any, DataTypes: any) => {
    const lockAiCustomerCounts = sequelize.define('lockAiCustomerCounts', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        websiteId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        aiCount: { type: DataTypes.INTEGER, defaultValue: 0 },
        active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
        date: { type: DataTypes.DATE, allowNull: true, defaultValue: null },   
    }, {});

    return lockAiCustomerCounts;
};


