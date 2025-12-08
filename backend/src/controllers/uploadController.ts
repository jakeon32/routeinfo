import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { supabase } from "../config/supabase";

// Multer 설정 (메모리 저장소 사용)
const storage = multer.memoryStorage();

// 파일 필터 (이미지만 허용)
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif만 가능)"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
});

// 단일 파일 업로드
export const uploadSingleFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
    }

    // 파일명 생성: timestamp-random-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(req.file.originalname);
    const basename = path.basename(req.file.originalname, ext);
    // 한글 등 특수문자 파일명 안전하게 처리 (선택사항, 영문 변환 등)
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, "");
    const filename = `${sanitizedBasename}-${uniqueSuffix}${ext}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from("photos")
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw error;
    }

    // Public URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from("photos")
      .getPublicUrl(filename);

    res.json({
      message: "파일 업로드 성공",
      url: publicUrl,
      filename: filename, // 나중에 삭제 시 필요
      originalname: req.file.originalname,
      size: req.file.size,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "파일 업로드 실패: " + (error.message || "Unknown error") });
  }
};

// 파일 삭제
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: "파일명이 제공되지 않았습니다." });
    }

    // Supabase Storage에서 삭제
    const { error } = await supabase.storage
      .from("photos")
      .remove([filename]);

    if (error) {
      console.error("Supabase storage delete error:", error);
      throw error;
    }

    res.json({ message: "파일 삭제 성공" });
  } catch (error: any) {
    console.error("File delete error:", error);
    res.status(500).json({ error: "파일 삭제 실패" });
  }
};
