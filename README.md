CloudExpress
CloudExpress is a web application that allows users to register, upload, list, download, and delete files. It utilizes MongoDB for user registration and AWS S3 for file storage.

Table of Contents :
Installation
Usage
Routes
Contributing
License

Installation

Clone the repository:
bash
git clone <repository-url>
cd <repository-name>

Install the required dependencies:
bash
npm install

Set up your environment variables. Create a .env file in the root directory and add the following:

env
REGION=<your-aws-region>
ACCESS_KEY=<your-aws-access-key>
ACCESS_SECRET_KEY=<your-aws-secret-access-key>
BUCKET=<your-s3-bucket-name>

Start the MongoDB server:

bash
mongod

Start the application:

bash
node app.js

Usage

Navigate to http://localhost:3000 in your web browser.
Register a new user by going to http://localhost:3000/register.
Log in with the registered credentials.
Upload files, list them, download them, or delete them.
Routes
GET /: Renders the login page.
GET /uploadfile: Renders the file upload page.
GET /register: Renders the registration page.
POST /registering: Registers a new user.
POST /verify: Verifies user login.
POST /upload: Uploads a file to AWS S3.
GET /list: Lists all files uploaded by the user.
GET /download/:folderName/:fileName: Downloads a specific file from AWS S3.
GET /download/:folderName: Downloads all files in a specific folder from AWS S3.
DELETE /delete/:fileName: Deletes a specific file from AWS S3.

Contributing

Fork the repository.
Create your feature branch (git checkout -b feature/AmazingFeature).
Commit your changes (git commit -m 'Add some AmazingFeature').
Push to the branch (git push origin feature/AmazingFeature).
Open a pull request.
