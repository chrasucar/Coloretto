"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSchema = exports.Game = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const card_schema_1 = require("./card/card.schema");
let Game = class Game {
};
exports.Game = Game;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Game.prototype, "owner", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, maxlength: 30 }),
    __metadata("design:type", String)
], Game.prototype, "gameName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 2, max: 5 }),
    __metadata("design:type", Number)
], Game.prototype, "maxPlayers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Game.prototype, "isAvailable", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Game.prototype, "players", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ _id: mongoose_2.Types.ObjectId, name: String }], default: [] }),
    __metadata("design:type", Array)
], Game.prototype, "aiPlayers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Game.prototype, "isAiControlled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], Game.prototype, "lastActivity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], Game.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], Game.prototype, "updatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: false }),
    __metadata("design:type", Date)
], Game.prototype, "preparationTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['Básico', 'Experto'] }),
    __metadata("design:type", String)
], Game.prototype, "difficultyLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Game.prototype, "isPrepared", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Game.prototype, "isFinished", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [card_schema_1.ColumnSchema], default: [] }),
    __metadata("design:type", Array)
], Game.prototype, "columns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Map, of: [{ type: card_schema_1.CardSchema }], default: {} }),
    __metadata("design:type", Map)
], Game.prototype, "summaryCards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Map, of: [{ type: card_schema_1.CardSchema }], default: {} }),
    __metadata("design:type", Map)
], Game.prototype, "wildCards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [card_schema_1.CardSchema], default: [] }),
    __metadata("design:type", Array)
], Game.prototype, "deck", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Map, of: { type: mongoose_2.default.Schema.Types.Mixed }, default: {} }),
    __metadata("design:type", Map)
], Game.prototype, "playerCollections", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Game.prototype, "isRoundCardRevealed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Game.prototype, "currentPlayerIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Game.prototype, "currentRound", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Game.prototype, "playersTakenColumn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Map, of: Number, default: {} }),
    __metadata("design:type", Object)
], Game.prototype, "finalScores", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Game.prototype, "winner", void 0);
exports.Game = Game = __decorate([
    (0, mongoose_1.Schema)()
], Game);
exports.GameSchema = mongoose_1.SchemaFactory.createForClass(Game);
exports.GameSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    },
});
//# sourceMappingURL=game.schema.js.map