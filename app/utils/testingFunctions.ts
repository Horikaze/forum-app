"use server";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
export async function saveFile(imageFile: File): Promise<string> {
  if (!imageFile || !imageFile.name) {
    throw new Error("Invalid file");
  }

  const uniqueName = `${nanoid()}-${imageFile.name}`;
  const filePath = path.join(process.cwd(), "public", "files", uniqueName);

  try {
    // Sprawdź, czy folder istnieje, jeśli nie, to go utwórz
    const folderPath = path.dirname(filePath);
    await fs.mkdir(folderPath, { recursive: true });

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(filePath, buffer);

    return `/files/${uniqueName}`;
  } catch (error) {
    console.error("Error saving image:", error);
    throw new Error("Failed to save image");
  }
}
export async function deleteFile(fileName: string) {
  if (!fileName) {
    throw new Error("Invalid file name");
  }
  const filePath = path.join(process.cwd(), "public", "files", fileName);
  try {
    await fs.unlink(filePath);
    console.log(`File ${fileName} deleted successfully`);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
}
