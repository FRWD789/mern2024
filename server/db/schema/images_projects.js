"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.images_projects_relations = exports.images_projects = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const projectes_1 = require("./projectes");
const drizzle_orm_1 = require("drizzle-orm");
exports.images_projects = (0, sqlite_core_1.sqliteTable)('images_projects', {
    id: (0, sqlite_core_1.integer)("id").references(() => projectes_1.projectes.id, { onDelete: "cascade", onUpdate: "cascade" }).notNull(),
    img_name: (0, sqlite_core_1.text)('img_name').notNull()
});
exports.images_projects_relations = (0, drizzle_orm_1.relations)(exports.images_projects, ({ one }) => ({
    project: one(projectes_1.projectes, {
        fields: [exports.images_projects.id],
        references: [projectes_1.projectes.id]
    })
}));
