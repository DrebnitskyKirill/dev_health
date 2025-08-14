import sequelize from "../config/database";
import User from "./User";
import Achievement, { UserAchievement, UserStatistics } from "./Achievement";
import UserSubscription, { SUBSCRIPTION_PLANS } from "./Subscription";

// Определяем связи
User.hasMany(UserAchievement, { foreignKey: "userId" });
UserAchievement.belongsTo(User, { foreignKey: "userId" });

Achievement.hasMany(UserAchievement, { foreignKey: "achievementId" });
UserAchievement.belongsTo(Achievement, { foreignKey: "achievementId" });

User.hasOne(UserStatistics, { foreignKey: "userId" });
UserStatistics.belongsTo(User, { foreignKey: "userId" });

User.hasOne(UserSubscription, { foreignKey: "userId" });
UserSubscription.belongsTo(User, { foreignKey: "userId" });

export { User, Achievement, UserAchievement, UserStatistics, UserSubscription, SUBSCRIPTION_PLANS, sequelize };
