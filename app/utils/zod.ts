import * as z from "zod";
import { validFileExtensions } from "../constants/forum";

const checkImagesSchema = z.object({
  file: z
    .any()
    .refine(
      (file) => file.size <= 2000 * 1024,
      (file: any) => ({
        message: `Plik musi być mniejszy niż 2MB. (${Number(file.size / 1024).toFixed()}KB)`,
      }),
    )
    .refine(
      (file: any) => {
        return validFileExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext),
        );
      },
      {
        message: `Dozwolone rozszerzenia to: ${validFileExtensions.join(", ")}`,
      },
    )
    .optional()
    .or(z.literal(null)),
});
export const checkImages = (files: File[]) => {
  files.forEach((element) => {
    const result = checkImagesSchema.safeParse({ file: element });
    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(" ");
      throw new Error(errorMessage);
    }
  });
};
