require("dotenv").config();
const { urlencoded } = require("express");
const express = require("express");
const app = express();
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary");
const PORT = process.env.PORT;

// middlewares
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);
app.set("view engine", "ejs");
// cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// routes
// get..
app.get("/", (req, res) => {
  res.status(200).send("<h1>Welcome to fileupload practice section</h1>");
});
app.get("/getform", (req, res) => {
  res.render("getForm");
});
app.get("/sendform", (req, res) => {
  res.render("sendForm");
});

// post..
app.post("/sendform", async (req, res) => {
  const file = req.files.image;
  console.log(file);
  // upload file locally
  //   const path = __dirname + "/images/" + Date.now() + ".jpg";
  //   file.mv(path, (error) => {
  //     if (error) res.status(500).send(error.message);
  //   });

  // update with cloudinary
  const uploadedFilesArray = [];
  let result;
  try {
    if (Array.isArray(file)) {
      // upload multiple file
      for (i = 0; i < file.length; i++) {
        result = await cloudinary.v2.uploader.upload(file[i].tempFilePath, {
          folder: "/fileupload",
        });
        uploadedFilesArray.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
      res.status(200).json({ body: req.body, uploadedFilesArray });
    } else {
      // upload single file in cloudinary
      const options = { folder: "/fileupload" };
      result = await cloudinary.v2.uploader.upload(file.tempFilePath, options);
      res.status(200).send({
        reqBody: req.body,
        public_id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});

// server listining
app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
