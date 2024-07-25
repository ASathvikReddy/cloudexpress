const express = require("express");
const pug=require('pug');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { Readable } = require("stream");
const app = express();
app.set('view engine', 'pug');
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static('public'));
require("dotenv").config();

const PORT = 3000;

const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.ACCESS_SECRET_KEY,
    }
});

const bucketName = process.env.BUCKET;
const uploadMiddleware = multer();

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

mongoose.connect("mongodb://localhost:27017/cloudexpress")
    .then(() => {
        console.log("MongoDB connection Successfully");
    })
    .catch((err) => {
        console  .log(err);
    });

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/uploadfile', (req, res) => {
    res.sendFile(__dirname + '/public/upload.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

const registerSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    mobile: String
});
const registerModel = mongoose.model('registermodel', registerSchema, 'registerdata');

app.post('/registering', async (req, res) => {
    const { username, password, email, mobile } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const registerData = new registerModel({
        username: username,
        password: hashedPassword,
        email: email,
        mobile: mobile
    });
    try {
        await registerData.save();
        res.sendFile(__dirname + '/public/login.html');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error registering user");
    }
});

let client;

app.post('/verify', async (req, res) => {
    const { username, password } = req.body;
    const data = await registerModel.findOne({ username: username });
    if (data) {
        const validity = await bcrypt.compare(password, data.password);
        if (validity) {
            client = username;
            res.sendFile(__dirname + '/public/upload.html');
        } else {
            res.send("INVALID PASSWORD");
        }
    } else {
        res.send("INVALID USERNAME");
    }
});

app.post('/upload', uploadMiddleware.single('file'), async (req, res) => {
    const file = req.file;
    const bodyStream = Readable.from(file.buffer);
    const imagelocation = `${client}/${file.originalname}`;
    const uploadParams = {
        client: s3Client,
        params: {
            Bucket: bucketName,
            Key: `${client}/${file.originalname}`,
            Body: bodyStream,
        },
    };
    try {
        const upload = new Upload(uploadParams);
        await upload.done();
        //res.redirect('/convert');
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).send("Error uploading file");
    }
});

app.get('/list', async(req,res)=>{
    const folderName = client;
    const listParams = {
        Bucket: bucketName,
        Prefix: `${folderName}/`
    };
    try {
        const data = await s3Client.send(new ListObjectsV2Command(listParams));
        const files = data.Contents.map(obj => obj.Key);
        res.render('list', { files });
        //res.send(files)
    } catch (error) {
        console.error("Error listing files:", error);
        res.status(500).send("Error listing files");
    }
});


const sanitizeFilename = (filename) => {
    return filename.replace(/[\\/:"*?<>|]/g, '');
};
app.get('/download/:folderName/:fileName', async (req, res) => {
    const folderName = req.params.folderName;
    const fileName = req.params.fileName;
    try {
        const listParams = {
            Bucket: bucketName,
            Prefix: `${folderName}/${fileName}`
        };
        const { Contents } = await s3Client.send(new ListObjectsV2Command(listParams));
        if (Contents.length === 0) {
            return res.status(404).send("File not found");
        }
        const fileObj = Contents[0]; // Assuming only one file matches the folder and file name
        const downloadParams = { Bucket: bucketName, Key: fileObj.Key };
        const sanitizedFileName = sanitizeFilename(fileName);
        const downloadFilePath = path.join(downloadsDir, sanitizedFileName);
        const { Body } = await s3Client.send(new GetObjectCommand(downloadParams));
        const fileStream = fs.createWriteStream(downloadFilePath);
        Body.pipe(fileStream);
        await new Promise((resolve, reject) => {
            fileStream.on('finish', () => {
                //console.log(`File ${fileName} downloaded successfully and saved to ${downloadFilePath}`);
                res.status(200).send(`File ${fileName} downloaded successfully`);
                resolve();
            });
            fileStream.on('error', (err) => {
                console.error("Error saving downloaded file:", err);
                reject(err);
            });
        });
    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).send("Error downloading file");
    }
});

app.get('/download/:folderName', async (req, res) => {
    const folderName = req.params.folderName;
    try {
        const listParams = {
            Bucket: bucketName,
            Prefix: `${folderName}/`
        };
        const { Contents } = await s3Client.send(new ListObjectsV2Command(listParams));
        for (const fileObj of Contents) {
            const fileName = fileObj.Key;
            if (fileName.endsWith('/')) continue;
            const downloadParams = { Bucket: bucketName, Key: fileName };
            const sanitizedFileName = sanitizeFilename(fileName);
            const downloadFilePath = path.join(downloadsDir, sanitizedFileName);
            const { Body } = await s3Client.send(new GetObjectCommand(downloadParams));
            const fileStream = fs.createWriteStream(downloadFilePath);
            Body.pipe(fileStream);
            await new Promise((resolve, reject) => {
                fileStream.on('finish', () => {
                    console.log(`File ${fileName} downloaded successfully and saved to ${downloadFilePath}`);
                    resolve();
                });
                fileStream.on('error', (err) => {
                    console.error("Error saving downloaded file:", err);
                    reject(err);
                });
            });
        }
        res.status(200).send("All files downloaded successfully");
    } catch (error) {
        console.error("Error downloading files:", error);
        res.status(500).send("Error downloading files");
    }
});

app.delete('/delete/:fileName', async (req, res) => {
    const fileName = req.params.fileName;
    const deleteParams = { Bucket: bucketName, Key: fileName };
    try {
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        res.send(`File ${fileName} deleted successfully`);
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).send("Error deleting file");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
