import { cleanupFiles } from "../helpers/cleanup-files.js";
import { saveFile } from "../utils/file.js";

export const multipartPreHandler = async (
  req,
  reply,
  checkForArrayElements = []
) => {
  const parts = req.parts();
  const body = {};
  const filePaths = [];

  try {
    for await (const part of parts) {
      if (part.file) {
        const filePath = await saveFile(part);
        part.fieldname in body
          ? body[part.fieldname].push(filePath)
          : (body[part.fieldname] = [filePath]);
        filePaths.push(filePath);
      } else {
        let value = part.value;

        // Normalize value
        if (value === "null") value = null;
        else if (value === "undefined") value = null;
        else if (value === "true") value = true;
        else if (value === "false") value = false;

        // Try parsing if explicitly needed
        if (checkForArrayElements.includes(part.fieldname)) {
          value = JSON.parse(value);
        }
        body[part.fieldname] = value;
      }
    }

    req.body = body;
    req.filePaths = filePaths;
    console.log({ body, filePaths });
  } catch (error) {
    if (filePaths.length) await cleanupFiles(filePaths);
    throw error;
  }
};
