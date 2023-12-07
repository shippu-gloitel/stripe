module.exports = (sequelize: any, DataTypes: any) => {
    const products = sequelize.define('products', {
        productId:{ type: DataTypes.STRING, allowNull: true, defaultValue: null },
        name: { type: DataTypes.STRING, require:true },
        active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
        description: { type: DataTypes.STRING,  allowNull: true,defaultValue: null },
        metadata:{ type: DataTypes.JSON, allowNull: true, defaultValue: null }
    }, {});

    return products;
};


