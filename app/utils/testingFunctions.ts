"use server";
import fs from "fs/promises";
import path from "path";

export async function saveImage(imageFile: File) {}
export async function deleteImage(fileName: string) {
  if (!fileName) {
    throw new Error("Invalid file name");
  }
  const filePath = path.join(process.cwd(), "public", "images", fileName);
  try {
    await fs.unlink(filePath);
    console.log(`File ${fileName} deleted successfully`);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
}
