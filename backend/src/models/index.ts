import sequelize from "../config/database";
import User from "./User";
import Achievement, { UserAchievement, UserStatistics } from "./Achievement";

// Определяем связи
User.hasMany(UserAchievement, { foreignKey: "userId" });
UserAchievement.belongsTo(User, { foreignKey: "userId" });

Achievement.hasMany(UserAchievement, { foreignKey: "achievementId" });
UserAchievement.belongsTo(Achievement, { foreignKey: "achievementId" });

User.hasOne(UserStatistics, { foreignKey: "userId" });
UserStatistics.belongsTo(User, { foreignKey: "userId" });

export { User, Achievement, UserAchievement, UserStatistics, sequelize };
