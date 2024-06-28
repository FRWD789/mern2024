import { text, sqliteTable,integer } from "drizzle-orm/sqlite-core";
import { projectes } from "./projectes";
import { relations } from "drizzle-orm";




export const images_projects = sqliteTable('images_projects', {
    id: integer("id").references(()=>projectes.id,{onDelete:"cascade",onUpdate:"cascade"}).notNull(),
    img_name: text('img_name').notNull()
});


export const images_projects_relations = relations(images_projects,({one})=>({
    project:one(projectes,{
        fields: [images_projects.id],
        references:[projectes.id]

    })
}))