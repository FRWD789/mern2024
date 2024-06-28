"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsRelations = exports.projectes = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const images_projects_1 = require("./images_projects");
const drizzle_orm_1 = require("drizzle-orm");
exports.projectes = (0, sqlite_core_1.sqliteTable)('projectes', {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    project_desc: (0, sqlite_core_1.text)('project_desc').notNull(),
    project_categorie: (0, sqlite_core_1.text)('project_categorie').notNull(),
    project_date: (0, sqlite_core_1.text)("project_date").default("2024")
});
exports.ProjectsRelations = (0, drizzle_orm_1.relations)(exports.projectes, ({ many }) => ({
    imges: many(images_projects_1.images_projects)
}));
