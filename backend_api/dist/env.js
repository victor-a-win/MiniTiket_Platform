"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.env = {
    PORT: parseInt(process.env.PORT || "4000", 10),
    JWT_SECRET: process.env.JWT_SECRET || "dev_secret_change_me",
};
