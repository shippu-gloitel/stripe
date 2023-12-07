module.exports = (sequelize: any, DataTypes: any) => {
    const users = sequelize.define('users', {
        firstName: { type: DataTypes.STRING, require:true},
        lastName: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        phoneNumber: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        // countryCode: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        email: { type: DataTypes.STRING,allowNull: true, defaultValue: null },
        avatar: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        password: { type: DataTypes.STRING, require:true },
        isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
        isRegister:{ type: DataTypes.BOOLEAN, defaultValue: false },
        isDeleted:{ type: DataTypes.BOOLEAN, defaultValue: false },
        registerType: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        createdAt: { type: DataTypes.DATE, defaultValue: null },
        countryCode: { type: DataTypes.STRING,  allowNull: true,defaultValue: null },
        customerId: { type: DataTypes.STRING,  allowNull: true,defaultValue: null },

    }, {});
    
    return users;
};


