"use server";
import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: "forum-storage.horikaze.pl",
  accessKey: process.env.AWS_ACCESS_KEY_ID!,
  secretKey: process.env.AWS_SECRET_ACCESS_KEY!,
});

// Funkcja do zapisywania plików w MinIO
export async function saveFile(
  imageFile: File,
  folder: string = "files",
): Promise<string> {
  try {
    if (!imageFile || !imageFile.name) {
      throw new Error("Invalid file");
    }

    // Konwersja pliku na Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = `${folder}/${imageFile.name}`;

    // Użycie length buffer jako długości
    await minioClient.putObject("forum", filePath, buffer, buffer.length, {
      "Content-Type": imageFile.type, // Ustawianie typu treści
    });

    console.log(`File uploaded to MinIO at ${filePath}`);
    return `https://forum-storage.horikaze.pl/forum/${filePath}`;
  } catch (error) {
    console.error("Error saving image to MinIO:", error);
    throw new Error("Failed to save image to MinIO");
  }
}

// Funkcja do usuwania plików z MinIO
export async function deleteFile(fileName: string) {
  console.log(fileName);
  try {
    if (!fileName) {
      throw new Error("Invalid file name");
    }
    const filePath = `${fileName.replace("https://forum-storage.horikaze.pl/forum/", "")}`;
    console.log(filePath);
    await minioClient.removeObject("forum", filePath);
  } catch (error) {
    console.error("Error deleting image from MinIO:", error);
    throw new Error("Failed to delete image from MinIO");
  }
}
