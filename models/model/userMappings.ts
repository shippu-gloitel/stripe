module.exports = (sequelize: any, DataTypes: any) => {
    const userMappings = sequelize.define('userMappings', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        cn_user_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
             defaultValue: 0,
             unique: true }
    }, {});

    return userMappings;
};


