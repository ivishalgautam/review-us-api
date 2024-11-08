"use strict";
import table from "../../db/models.js";

const getReport = async (req, res) => {
  const lastMonth = await table.ReviewModel.countReview("lastMonth");
  const currMonth = await table.ReviewModel.countReview("currMonth");
  const total = await table.ReviewModel.countReview();
  let reports = {};
  reports.last_month = lastMonth;
  reports.curr_month = currMonth;
  reports.total = total;

  return res.send(reports);
};

export default {
  getReport: getReport,
};
