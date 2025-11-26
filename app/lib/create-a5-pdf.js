import path from "path";
import { createCanvas, loadImage, registerFont } from "canvas";

export async function createA5PdfWithOverlay(fullBase64Image, logoBase64) {
  // Use 300 DPI dimensions for A5
  const width = 1748;
  const height = 2481;

  const canvas = createCanvas(width, height, "pdf");
  const ctx = canvas.getContext("2d");

  const templatePath = path.join(process.cwd(), "public/images/template.png");
  const template = await loadImage(templatePath);

  // Draw template at native resolution — NO SCALING
  ctx.drawImage(template, 0, 0, width, height);

  // --- LOGO (scaled properly)
  const logo = await loadImage(logoBase64);
  const maxLogoW = 520;
  const maxLogoH = 520;

  const logoScale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height);
  const finalLogoW = logo.width * logoScale;
  const finalLogoH = logo.height * logoScale;

  ctx.drawImage(logo, (width - finalLogoW) / 2, 100, finalLogoW, finalLogoH);

  // --- QR Overlay (scaled properly)
  const qr = await loadImage(fullBase64Image);
  const qrSize = 800; // prints sharp

  ctx.drawImage(qr, (width - qrSize) / 2, 790, qrSize, qrSize);

  return canvas.toBuffer("application/pdf", {
    density: 300,
  });
}
