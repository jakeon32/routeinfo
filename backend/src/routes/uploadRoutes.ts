import express from "express";
import { upload, uploadSingleFile, deleteFile } from "../controllers/uploadController";

const router = express.Router();

// 단일 파일 업로드
router.post("/", upload.single("photo"), uploadSingleFile);

// 파일 삭제
router.delete("/:filename", deleteFile);

export default router;
