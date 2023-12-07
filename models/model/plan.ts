module.exports = (sequelize: any, DataTypes: any) => {
  const cards = sequelize.define(
    'plans',
    {
      name: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      stripePlanId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      expiryTime: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      createdAt: { type: DataTypes.DATE, defaultValue: null },
    },
    {}
  );

  return cards;
};
