// import multer from "multer";

// const storage = multer.memoryStorage();

// export const upload = multer({
//     storage,
// });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only images are allowed"), false);
      }
      cb(null, true);
    },
  });