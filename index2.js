// const express = require("express");
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const fs = require('fs');
// const path = require('path');
// const multer = require("multer");
// const { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
// const { Upload } = require("@aws-sdk/lib-storage");
// const { Readable } = require("stream");
// const app = express();
// app.use(express.urlencoded());
// app.use(express.json());
// app.use(express.static('public'));
// require("dotenv").config();

// const PORT = 3000;

// const s3Client = new S3Client({
//     region: process.env.REGION,
//     credentials: {
//         accessKeyId: process.env.ACCESS_KEY,
//         secretAccessKey: process.env.ACCESS_SECRET_KEY,
//     }
// });

// const bucketName = process.env.BUCKET;
// const uploadMiddleware = multer();

// const downloadsDir = path.join(__dirname, 'downloads');
// if (!fs.existsSync(downloadsDir)) {
//     fs.mkdirSync(downloadsDir, { recursive: true });
// }

// // MongoDB connection
// mongoose.connect("mongodb://localhost:27017/cloudexpress")
//     .then(() => {
//         console.log("MongoDB connection Successfully");
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// // Routes
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/login.html');
// });

// app.get('/uploadfile', (req, res) => {
//     res.sendFile(__dirname + '/public/upload.html');
// });

// app.get('/register', (req, res) => {
//     res.sendFile(__dirname + '/public/register.html');
// });

// // MongoDB schema and model
// const registerSchema = new mongoose.Schema({
//     username: String,
//     password: String,
//     email: String,
//     mobile: String
// });
// const registerModel = mongoose.model('registermodel', registerSchema, 'registerdata');

// app.post('/registering', async (req, res) => {
//     const { username, password, email, mobile } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const registerData = new registerModel({
//         username: username,
//         password: hashedPassword,
//         email: email,
//         mobile: mobile
//     });
//     try {
//         await registerData.save();
//         res.sendFile(__dirname + '/public/login.html');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error registering user");
//     }
// });

// let client;

// app.post('/verify', async (req, res) => {
//     const { username, password } = req.body;
//     const data = await registerModel.findOne({ username: username });
//     if (data) {
//         const validity = await bcrypt.compare(password, data.password);
//         if (validity) {
//             client = username;
//             res.sendFile(__dirname + '/public/upload.html');
//         } else {
//             res.send("INVALID PASSWORD");
//         }
//     } else {
//         res.send("INVALID USERNAME");
//     }
// });

// app.post('/upload', uploadMiddleware.single('file'), async (req, res) => {
//     const file = req.file;
//     const bodyStream = Readable.from(file.buffer);
//     const imagelocation = `${client}/${file.originalname}`;
//     const uploadParams = {
//         client: s3Client,
//         params: {
//             Bucket: bucketName,
//             Key: `${client}/${file.originalname}`,
//             Body: bodyStream,
//         },
//     };
//     try {
//         const upload = new Upload(uploadParams);
//         await upload.done();
//         res.redirect('/convert');
//     } catch (error) {
//         console.error("Error uploading file:", error);
//         res.status(500).send("Error uploading file");
//     }
// });

// // const axios = require('axios');
// // const { createCanvas, loadImage } = require("canvas");

// // app.get("/convert", async (req, res) => {
// //     const imageUrl = `https://${bucketName}.s3.${process.env.REGION}.amazonaws.com/${client}`;
// //     try {
// //         const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
// //         const buffer = Buffer.from(response.data, "binary");
// //         const image = await loadImage(buffer);
// //         const canvas = createCanvas(image.width, image.height);
// //         const ctx = canvas.getContext("2d");
// //         ctx.drawImage(image, 0, 0);
// //         const dataUrl = canvas.toDataURL("image/png");
// //         res.send(`<html><body><img src="${dataUrl}"></body></html>`);
// //     } catch (error) {
// //         console.error("Error converting image:", error);
// //         res.status(500).send("Error converting image");
// //     }
// // });

// const sanitizeFilename = (filename) => {
//     return filename.replace(/[\\/:"*?<>|]/g, '');
// };

// app.get('/download/:folderName', async (req, res) => {
//     const folderName = req.params.folderName;
//     try {
//         const listParams = {
//             Bucket: bucketName,
//             Prefix: `${folderName}/`
//         };
//         const { Contents } = await s3Client.send(new ListObjectsV2Command(listParams));
//         for (const fileObj of Contents) {
//             const fileName = fileObj.Key;
//             if (fileName.endsWith('/')) continue;
//             const downloadParams = { Bucket: bucketName, Key: fileName };
//             const sanitizedFileName = sanitizeFilename(fileName);
//             const downloadFilePath = path.join(downloadsDir, sanitizedFileName);
//             const { Body } = await s3Client.send(new GetObjectCommand(downloadParams));
//             const fileStream = fs.createWriteStream(downloadFilePath);
//             Body.pipe(fileStream);
//             await new Promise((resolve, reject) => {
//                 fileStream.on('finish', () => {
//                     console.log(`File ${fileName} downloaded successfully and saved to ${downloadFilePath}`);
//                     resolve();
//                 });
//                 fileStream.on('error', (err) => {
//                     console.error("Error saving downloaded file:", err);
//                     reject(err);
//                 });
//             });
//         }
//         res.status(200).send("All files downloaded successfully");
//     } catch (error) {
//         console.error("Error downloading files:", error);
//         res.status(500).send("Error downloading files");
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });





















// const express = require("express");
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// // const fileupload=require('express-fileupload');
// const fs = require('fs');
// const path = require('path');
// const multer = require("multer");
// const { S3Client, GetObjectCommand,DeleteObjectCommand} = require("@aws-sdk/client-s3");
// const { Upload } = require("@aws-sdk/lib-storage");
// const { Readable } = require("stream");
// const app = express();
// app.use(express.urlencoded());
// app.use(express.json());
// app.use(express.static('public'));
// // app.use(fileupload());
// require("dotenv").config();

// const PORT = 3000;

// const s3Client = new S3Client({
//     region: process.env.REGION,
//     credentials: {
//         accessKeyId: process.env.ACCESS_KEY,
//         secretAccessKey: process.env.ACCESS_SECRET_KEY,
//     }
// });

// const bucketName = process.env.BUCKET;
// const uploadMiddleware = multer();

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
// const b = mongoose.connect("mongodb://localhost:27017/cloudexpress");
// b.then(() => {
//     console.log("MongoDB connection Successfully");
// })
// b.catch((err) => {
//     console.log(err);
// })
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/login.html');
// })

// app.get('/uploadfile',(req,res)=>{
//     res.sendFile(__dirname+'/public/upload.html')
// })

// app.get('/register',(req,res)=>{
//     res.sendFile(__dirname+'/public/register.html')
// })
// let registerschema=new mongoose.Schema({
//     username:String,
//     password: String,
//     email: String,
//     mobile: String
// })
// let registermodel = new mongoose.model('registermodel', registerschema, 'registerdata');
// app.post('/registering', async (req, res) => {
//     const { username, password, email, mobile } = req.body;
//     const hashedPassword = await bcrypt.hash(password,10);
//     const registerdata = new registermodel({
//         username: username,
//         password: hashedPassword,
//         email: email,
//         mobile: mobile
//     });
//     try {
//         const data = await registerdata.save();
//         res.sendFile(__dirname + '/public/login.html');
//     } catch (error) {
//         console.error(error);
//     }
// });
// let client;
// app.post('/verify', async (req, res) => {
//     const  {username,password}  = req.body;
//     const data = await registermodel.findOne({ username: username });
//     if (data) {
//         const validity = await bcrypt.compare(password, data.password);
//         if (validity) {
//             client = username;
//             res.sendFile(__dirname+'/public/upload.html');
//         } else {
//             res.send("INVALID PASSWORD");
//         }
//     }
//     else {
//         res.send("INVALID USERNAME");
//     }
// });
// let imagelocation;

// app.post('/upload', uploadMiddleware.single('file'), async (req, res) => {
//     const file = req.file;
//     const bodyStream = Readable.from(file.buffer);
//     imagelocation = `${client}/${file.originalname}`;
//     const uploadParams = {
//         client: s3Client,
//         params: {
//             Bucket: bucketName,
//             Key:`${client}/${file.originalname}`,
//             Body: bodyStream,
//         },
//     };
//     try {
//         const upload = new Upload(uploadParams);
//         const { Key } = await upload.done();
//         res.redirect('/convert');
//     } catch (error) {
//         console.error("Error uploading file:", error);
//         res.status(500).send("Error uploading file");
//     }
// });

// // const axios = require('axios');
// // const { createCanvas, loadImage } = require("canvas");

// // app.get("/convert", async (req, res) => {
// // const imageUrl =
// //     `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/${imagelocation}`;
// // try {
// //     const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
// //     const buffer = Buffer.from(response.data, "binary");
// //     //console.log(buffer);
// //     const image = await loadImage(buffer);
// //     const canvas = createCanvas(image.width, image.height);
// //     const ctx = canvas.getContext("2d");
// //     ctx.drawImage(image, 0, 0);
// //     const dataUrl = canvas.toDataURL("image/png");
// //     res.send(`<html><body><img src="${dataUrl}"></body></html>`);
// // } catch (error) {
// //     console.error("Error converting image:", error);
// //     res.status(500).send("Error converting image");
// // }
// // });


// // const { ListObjectsV2Command } = require("@aws-sdk/client-s3");

// // app.get('/list/:folderName', async(req,res)=>{
// //     const folderName = req.params.folderName;
// //     const listParams = {
// //         Bucket: bucketName,
// //         Prefix: `${folderName}/`
// //     };

// //     try {
// //         const data = await s3Client.send(new ListObjectsV2Command(listParams));
// //         const files = data.Contents.map(obj => obj.Key);
// //         res.send(files);
// //     } catch (error) {
// //         console.error("Error listing files:", error);
// //         res.status(500).send("Error listing files");
// //     }
// // });

// // app.get('/list',async(req,res)=>{
// //         let r = await s3.listObjects({ Bucket: bucketName }).promise();
// //         let x = res.Contents.map(x => x.Key);
// //         res.send(x);
// // })

// const { ListObjectsV2Command } = require("@aws-sdk/client-s3");
// const downloadsDir = path.join(__dirname, 'downloads', folderName);
// if (!fs.existsSync(downloadsDir)) {
//     fs.mkdirSync(downloadsDir, { recursive: true });
// }

// const downloadFilePath = path.join(downloadsDir, fileName);

// app.get('/download/:folderName', async (req, res) => {
//     const folderName = req.params.folderName;
//     try {
//         const listParams = {
//             Bucket: bucketName,
//             Prefix: `${folderName}/`
//         };
//         const { Contents } = await s3Client.send(new ListObjectsV2Command(listParams));
//         for (const fileObj of Contents) {
//             const fileName = fileObj.Key;
//             if (fileName.endsWith('/')) continue;
//             const downloadParams = { Bucket: bucketName, Key: fileName };
//             const downloadFilePath = path.join(__dirname, 'downloads', fileName);
//             const { Body } = await s3Client.send(new GetObjectCommand(downloadParams));
//             const fileStream = fs.createWriteStream(downloadFilePath);
//             Body.pipe(fileStream);
//             await new Promise((resolve, reject) => {
//                 fileStream.on('finish', () => {
//                     console.log(`File ${fileName} downloaded successfully and saved to ${downloadFilePath}`);
//                     resolve();
//                 });
//                 fileStream.on('error', (err) => {
//                     console.error("Error saving downloaded file:", err);
//                     reject(err);
//                 });
//             });
//         }
//         res.status(200).send("All files downloaded successfully");
//     } catch (error) {
//         console.error("Error downloading files:", error);
//         res.status(500).send("Error downloading files");
//     }
// });

// app.delete('/delete/:fileName', async (req, res) => {
//     const fileName = req.params.fileName;
//     const deleteParams = { Bucket: bucketName, Key: fileName };
//     try {
//         await s3Client.send(new DeleteObjectCommand(deleteParams));
//         res.send(`File ${fileName} deleted successfully`);
//     } catch (error) {
//         console.error("Error deleting file:", error);
//         res.status(500).send("Error deleting file");
//     }
// });