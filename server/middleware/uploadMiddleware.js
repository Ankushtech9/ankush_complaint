import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const filter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  cb(null, allowed.includes(file.mimetype));
};

export default multer({ storage, fileFilter: filter, limits: { fileSize: 5 * 1024 * 1024 } });
