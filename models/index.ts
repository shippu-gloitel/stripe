import database from "../database/database";

const { users, userMappings, websites, billing, cards,prices,
  appearances,messages,billingHistory,qaCsvFiles,
  lockAiCustomerCounts
} =
  database.models;

// One-to-One Relationship

userMappings.belongsTo(users, { foreignKey: "userId", sourceKey: "id" });
users.hasOne(userMappings, { onDelete: "cascade", hooks: true });

websites.belongsTo(users, { foreignKey: "userId", sourceKey: "id" });
users.hasOne(websites, { onDelete: "cascade", hooks: true });

billing.belongsTo(users, { foreignKey: "userId", sourceKey: "id" });
users.hasOne(billing, { onDelete: "cascade", hooks: true });

cards.belongsTo(users, { foreignKey: "userId", sourceKey: "id" });
users.hasOne(cards, { onDelete: "cascade", hooks: true });

billing.belongsTo(prices, { foreignKey: 'priceSourceKey', sourceKey: 'id' });

appearances.belongsTo(users, { foreignKey: "userId", sourceKey: "id" });
users.hasOne(appearances, { onDelete: "cascade", hooks: true });

messages.belongsTo(users, { foreignKey: "userId", sourceKey: "id" });
users.hasOne(messages, { onDelete: "cascade", hooks: true });

billingHistory.belongsTo(users, { foreignKey: "userId", sourceKey: "id" });
users.hasOne(billingHistory, { onDelete: "cascade", hooks: true });

qaCsvFiles.belongsTo(users, { foreignKey: "userId", sourceKey: "id" });
users.hasOne(qaCsvFiles, { onDelete: "cascade", hooks: true });

lockAiCustomerCounts.belongsTo(users, { foreignKey: "userId", sourceKey: "id" });
users.hasOne(lockAiCustomerCounts, { onDelete: "cascade", hooks: true });

module.exports = database.models;
