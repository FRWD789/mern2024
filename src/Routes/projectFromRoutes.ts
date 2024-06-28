import { Router } from "express";
import { createProjectPost,uploadMiddleware ,getProjects,deleteProject} from "../controllers/projectFromController";


const router = Router()
router.post("/submit",uploadMiddleware,createProjectPost)
router.get("/projects",getProjects)
router.delete("/projects/:id",deleteProject)

export {router as ProjectFormRoutes}