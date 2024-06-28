import { Response,Request, Router } from "express";
import multer from "multer";
import { PutObjectCommand,GetObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3";
import db from "../db/db_Index";
import { projectes } from "../db/schema/projectes";
import { images_projects } from "../db/schema/images_projects";
import { v4 } from "uuid";
import { eq } from "drizzle-orm";


// Multer config
const storage = multer.memoryStorage()
const upload = multer({storage} )
//upload to s3
 
const uploadFile = async (Filebuffer : Buffer,FileName:string ,ContentType : string): Promise<string> =>{
    const Key = `${v4()}-${FileName}`
    const params = {
         Bucket: "portoflio2024",
         Key,
         Body:Filebuffer,
         ContentType
    }
    const command = new PutObjectCommand(params)
    await s3.send(command);
    return Key
}


export const createProjectPost =async (req:Request,res:Response)=>{

    try{

        // validate request data 
        
        const {categorie,date,desc} = req.body
        if(!categorie || !date  || !desc){
            console.log(req.body)
            return res.status(400).send("bad request");
           
        }
        
        const fileNames:Array<string> = []
        if(req.files){

            for (const file of req.files as Express.Multer.File[]){
                fileNames.push(await uploadFile(file.buffer,file.originalname,file.mimetype))

            }
            
           

        }

    const post_id = await db.insert(projectes)
    .values({
            project_desc:desc,
            project_categorie:categorie,
            project_date:date })
    .returning({id:projectes.id})
    fileNames.forEach(async (fileName)=>{
        await db.insert(images_projects).values(
            {
                id:post_id[0].id,
                img_name:fileName
            }
        )
    })

    res.status(201).send('Post created successfully.');
    }catch(e){
        res.status(500).send('Internal Server Error');
    }

}


export const getProjects = async (req:Request,res:Response)=>{

    try  { 
            const posts  = await db.query.projectes.findMany({
                                with:{
                                    imges:{
                                        columns:{
                                            id:false
                                        }
                                    }
                                }
                            })
            if(!posts){
                return res.status(400).send("<script>alert('test')</script>");

                }

        for (const post of  posts){

            for (const img of post.imges){
                const getObjectParams = {
                    Bucket: "portoflio2024",
                    Key:img.img_name
            
                }
                const command = new GetObjectCommand(getObjectParams)
                const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
                img.img_name =url 
            }

        }
        res.send(posts)

    }catch(Error){
        res.status(500).send('Internal Server Error');

    }
    

}


export const deleteProject = async ( req:Request , res:Response ) =>{


        const id = req.params.id
        const post = await db.query.projectes.findFirst({
            where: (projectes, { eq }) => eq(projectes.id,Number(id)),
            with:{
                imges:{
                    columns:{
                        id:false
                    }
                }
            }
    
        })

        if(!post){
            return res.status(404).send("No post Matches .")
        }
        for(const img of post.imges) {
                    const params = {
                    Bucket: "portoflio2024",
                    Key:img.img_name
                }
                const command = new DeleteObjectCommand(params)
                await s3.send(command)
        }
        await db.delete(images_projects).where(eq(images_projects.id,Number(id)));
        await db.delete(projectes).where(eq(projectes.id,Number(id)));




        res.send({}).status(201)
        





}
export const uploadMiddleware = upload.array("imges",15)