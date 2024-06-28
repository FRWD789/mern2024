import { text, sqliteTable,integer } from "drizzle-orm/sqlite-core"
import { images_projects } from "./images_projects";
import { relations } from "drizzle-orm";

export const projectes= sqliteTable('projectes', {
    id: integer("id").primaryKey({autoIncrement:true}),
    project_desc: text('project_desc').notNull(),
    project_categorie: text('project_categorie').notNull(),
    project_date:  text("project_date").default("2024")
});


export const ProjectsRelations = relations(projectes,({many})=>({
    imges:many(images_projects)

}))


