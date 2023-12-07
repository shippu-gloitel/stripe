module.exports = (sequelize: any, DataTypes: any) => {
    const cards = sequelize.define('cards', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        cardNumber: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        expMonth: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        expYear: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        cvcNumber: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        cardId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        cardName: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
        createdAt: { type: DataTypes.DATE, defaultValue: null }
    }, {});

    return cards;
};


