module.exports = (sequelize: any, DataTypes: any) => {
    const prices = sequelize.define('prices', {
        productId:{ type: DataTypes.STRING, allowNull: true, defaultValue: null },
        priceId:{ type: DataTypes.STRING, allowNull: true, defaultValue: null },
        name: { type: DataTypes.STRING, require:true },
        amount:{ type: DataTypes.STRING, allowNull: true, defaultValue: null },
        active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
        metadata:{ type: DataTypes.JSON, allowNull: true, defaultValue: null }
    }, {});

    return prices;
};


