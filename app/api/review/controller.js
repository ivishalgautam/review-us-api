"use strict";
import config from "../../config/index.js";
import table from "../../db/models.js";
import { ErrorHandler } from "../../helpers/handleError.js";
import { QrGenerator } from "../../lib/qr-generator.js";

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

  res.send(qr);
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
