"use server";
import fs from "fs/promises";
import path from "path";
export async function saveFile(
  imageFile: File,
  folder: string = "files",
): Promise<string> {
  if (!imageFile || !imageFile.name) {
    throw new Error("Invalid file");
  }
  const filePath = path.join(process.cwd(), "public", folder, imageFile.name);
  console.log(filePath);
  try {
    const folderPath = path.dirname(filePath);
    await fs.mkdir(folderPath, { recursive: true });

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(filePath, buffer);

    return `/${folder}/${imageFile.name}`;
  } catch (error) {
    console.error("Error saving image:", error);
    throw new Error("Failed to save image");
  }
}

export async function deleteFile(fileName: string) {
  if (!fileName) {
    throw new Error("Invalid file name");
  }

  const filePath = path.join(process.cwd(), "public", fileName);
  const folderPath = path.dirname(filePath);

  try {
    await fs.unlink(filePath);
    const filesInFolder = await fs.readdir(folderPath);
    if (filesInFolder.length === 0) {
      await fs.rmdir(folderPath);
      console.log(`Folder ${folderPath} deleted as it was empty`);
    }
  } catch (error) {
    console.error("Error deleting image or folder:", error);
    throw new Error("Failed to delete image or folder");
  }
}
