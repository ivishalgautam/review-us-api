import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createCanvas, loadImage } from "canvas";

export async function createImageWithOverlay(
  businessName = "Brandingwaale Webtech",
  fullBase64Image
) {
  const canvas = createCanvas(1020, 1800); // Adjust dimensions as needed
  const context = canvas.getContext("2d");

  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = dirname(currentFilePath);
  const publicPath = path.join(
    currentDirPath,
    "../../public/images/",
    "template.png"
  );

  // Load the base image
  const image = await loadImage(publicPath); // Base image
  context.drawImage(image, 0, 0);

  context.font = "bold 60px Arial";
  context.fillStyle = "black";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const text = businessName;
  const maxWidth = 400;
  const lineHeight = 70;

  wrapText(context, text, 520, 200, maxWidth, lineHeight);

  // Load the overlay image from Base64 string
  const overlayImage = await loadImage(fullBase64Image);
  context.drawImage(overlayImage, 270, 810, 500, 500); // Adjust size and position

  return canvas.toBuffer(); // Returns the buffer for further use
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight; // Move to the next line
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}
