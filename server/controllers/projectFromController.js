"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = exports.deleteProject = exports.getProjects = exports.createProjectPost = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_1 = require("../config/s3");
const db_Index_1 = __importDefault(require("../db/db_Index"));
const projectes_1 = require("../db/schema/projectes");
const images_projects_1 = require("../db/schema/images_projects");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
// Multer config
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
//upload to s3
const uploadFile = (Filebuffer, FileName, ContentType) => __awaiter(void 0, void 0, void 0, function* () {
    const Key = `${(0, uuid_1.v4)()}-${FileName}`;
    const params = {
        Bucket: "portoflio2024",
        Key,
        Body: Filebuffer,
        ContentType
    };
    const command = new client_s3_1.PutObjectCommand(params);
    yield s3_1.s3.send(command);
    return Key;
});
const createProjectPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // validate request data 
        const { categorie, date, desc } = req.body;
        if (!categorie || !date || !desc) {
            console.log(req.body);
            return res.status(400).send("bad request");
        }
        const fileNames = [];
        if (req.files) {
            for (const file of req.files) {
                fileNames.push(yield uploadFile(file.buffer, file.originalname, file.mimetype));
            }
        }
        const post_id = yield db_Index_1.default.insert(projectes_1.projectes)
            .values({
            project_desc: desc,
            project_categorie: categorie,
            project_date: date
        })
            .returning({ id: projectes_1.projectes.id });
        fileNames.forEach((fileName) => __awaiter(void 0, void 0, void 0, function* () {
            yield db_Index_1.default.insert(images_projects_1.images_projects).values({
                id: post_id[0].id,
                img_name: fileName
            });
        }));
        res.status(201).send('Post created successfully.');
    }
    catch (e) {
        res.status(500).send('Internal Server Error');
    }
});
exports.createProjectPost = createProjectPost;
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield db_Index_1.default.query.projectes.findMany({
            with: {
                imges: {
                    columns: {
                        id: false
                    }
                }
            }
        });
        if (!posts) {
            return res.status(400).send("<script>alert('test')</script>");
        }
        for (const post of posts) {
            for (const img of post.imges) {
                const getObjectParams = {
                    Bucket: "portoflio2024",
                    Key: img.img_name
                };
                const command = new client_s3_1.GetObjectCommand(getObjectParams);
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3_1.s3, command, { expiresIn: 3600 });
                img.img_name = url;
            }
        }
        res.send(posts);
    }
    catch (Error) {
        res.status(500).send('Internal Server Error');
    }
});
exports.getProjects = getProjects;
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const post = yield db_Index_1.default.query.projectes.findFirst({
        where: (projectes, { eq }) => eq(projectes.id, Number(id)),
        with: {
            imges: {
                columns: {
                    id: false
                }
            }
        }
    });
    if (!post) {
        return res.status(404).send("No post Matches .");
    }
    for (const img of post.imges) {
        const params = {
            Bucket: "portoflio2024",
            Key: img.img_name
        };
        const command = new client_s3_1.DeleteObjectCommand(params);
        yield s3_1.s3.send(command);
    }
    yield db_Index_1.default.delete(images_projects_1.images_projects).where((0, drizzle_orm_1.eq)(images_projects_1.images_projects.id, Number(id)));
    yield db_Index_1.default.delete(projectes_1.projectes).where((0, drizzle_orm_1.eq)(projectes_1.projectes.id, Number(id)));
    res.send({}).status(201);
});
exports.deleteProject = deleteProject;
exports.uploadMiddleware = upload.array("imges", 15);
