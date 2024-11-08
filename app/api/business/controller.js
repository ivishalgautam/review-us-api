"use strict";
import table from "../../db/models.js";

const getBusinessProfile = async (req, res) => {
  res.send(await table.BusinessModel.getByUserId(req.user_data.id));
};

const getById = async (req, res) => {
  res.send(await table.BusinessModel.getById(req));
};

export default {
  getBusinessProfile: getBusinessProfile,
  getById: getById,
};
