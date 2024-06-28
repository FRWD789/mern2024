import express, { urlencoded } from 'express'
import { ProjectFormRoutes } from './Routes/projectFromRoutes';
import path  from 'path';
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080
app.use(cors())
app.use(express.static(path.join(__dirname,'client')))
app.use(express.json())
app.use(express.urlencoded({extended:true})) //for default form type 
app.use('/api',ProjectFormRoutes)
app.get("*", (req, res) =>{
   const indexFile = path.join(__dirname,'client','index.html')
   res.sendFile(indexFile)
})
app.listen(PORT,()=>{
   console.log(`app is running at http://localhost:${PORT}`)
})