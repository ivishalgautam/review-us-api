"use strict";
import table from "../../db/models.js";
import { ErrorHandler } from "../../helpers/handleError.js";

const getReport = async (req, res) => {
  let reports = {};

  if (req.user_data.role === "admin") {
    const lastMonth = await table.UserModel.countUser("lastMonth");

    const currMonth = await table.UserModel.countUser("currMonth");

    const total = await table.UserModel.countUser();

    reports.last_month = lastMonth;
    reports.curr_month = currMonth;
    reports.total = total;

    return res.send(reports);
  }

  const record = await table.BusinessModel.getByUserId(req.user_data.id);
  if (!record)
    return ErrorHandler({ code: 404, message: "Business not found!" });
  const businessId = record.id;

  const lastMonth = await table.ReviewModel.countReview(
    businessId,
    "lastMonth"
  );

  const currMonth = await table.ReviewModel.countReview(
    businessId,
    "currMonth"
  );

  const total = await table.ReviewModel.countReview(businessId);
  reports.last_month = lastMonth;
  reports.curr_month = currMonth;
  reports.total = total;

  return res.send(reports);
};

export default {
  getReport: getReport,
};
