"use strict";
import config from "../../config/index.js";
import table from "../../db/models.js";
import { ErrorHandler } from "../../helpers/handleError.js";
import { createA5PdfWithOverlay } from "../../lib/create-a5-pdf.js";
import { createImageWithOverlay } from "../../lib/create-canvas.js";
import { QrGenerator } from "../../lib/qr-generator.js";
import path from "path";
import fs from "fs";

const create = async (req, res) => {
  const record = await table.BusinessModel.getById(0, req.body.business_id);
  if (!record)
    return ErrorHandler({ code: 404, message: "Business not found!" });

  await table.ReviewModel.create(req);
  res.send({ message: "Review created successfully." });
};

const createReviewCard = async (req, res) => {
  const record = await table.BusinessModel.getByUserId(req.user_data.id);
  const qr = await QrGenerator(
    `${config.qr_base}/reviews/create?businessId=${record.id}&businessLink=${record.business_link}`
  );

  const logoPath = path.join(process.cwd(), record.logo[0]);
  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;

  const pdfBuffer = await createA5PdfWithOverlay(qr, logoBase64);

  res.header("Content-Type", "application/pdf");
  res.header("Content-Disposition", "attachment; filename=review-card.pdf");
  res.send(pdfBuffer);
};

const get = async (req, res) => {
  const data = await table.ReviewModel.get(req);
  res.send(data);
};

const getByUserId = async (req, res) => {
  const data = await table.ReviewModel.get(req);
  res.send(data);
};

export default {
  create: create,
  get: get,
  getByUserId: getByUserId,
  createReviewCard: createReviewCard,
};
