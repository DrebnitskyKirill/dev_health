"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.Payment = exports.SUBSCRIPTION_PLANS = exports.UserSubscription = exports.UserStatistics = exports.UserAchievement = exports.Achievement = exports.User = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.sequelize = database_1.default;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Achievement_1 = __importStar(require("./Achievement"));
exports.Achievement = Achievement_1.default;
Object.defineProperty(exports, "UserAchievement", { enumerable: true, get: function () { return Achievement_1.UserAchievement; } });
Object.defineProperty(exports, "UserStatistics", { enumerable: true, get: function () { return Achievement_1.UserStatistics; } });
const Subscription_1 = __importStar(require("./Subscription"));
exports.UserSubscription = Subscription_1.default;
Object.defineProperty(exports, "SUBSCRIPTION_PLANS", { enumerable: true, get: function () { return Subscription_1.SUBSCRIPTION_PLANS; } });
const Payment_1 = __importDefault(require("./Payment"));
exports.Payment = Payment_1.default;
// Определяем связи
User_1.default.hasMany(Achievement_1.UserAchievement, { foreignKey: "userId" });
Achievement_1.UserAchievement.belongsTo(User_1.default, { foreignKey: "userId" });
Achievement_1.default.hasMany(Achievement_1.UserAchievement, { foreignKey: "achievementId" });
Achievement_1.UserAchievement.belongsTo(Achievement_1.default, { foreignKey: "achievementId" });
User_1.default.hasOne(Achievement_1.UserStatistics, { foreignKey: "userId" });
Achievement_1.UserStatistics.belongsTo(User_1.default, { foreignKey: "userId" });
User_1.default.hasOne(Subscription_1.default, { foreignKey: "userId" });
Subscription_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
User_1.default.hasMany(Payment_1.default, { foreignKey: "userId" });
Payment_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
