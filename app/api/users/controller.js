"use strict";

import table from "../../db/models.js";
import hash from "../../lib/encryption/index.js";
import { ErrorHandler } from "../../helpers/handleError.js";
import { sequelize } from "../../db/postgres.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { getItemsToDelete } from "../../helpers/filter.js";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  req.body.role = "admin";
  await table.UserModel.create(req, { transaction });

  await transaction.commit();
  return res.send({ status: true, message: "User created" });
};

const createBusiness = async (req, res) => {
  const transaction = await sequelize.transaction();
  const record = await table.UserModel.create(req);
  if (record) {
    await table.BusinessModel.create(req, record.id);
  } else {
    return ErrorHandler({ code: 400, message: "Error creating business!" });
  }

  await transaction.commit();
  return res.send({ status: true, message: "User created" });
};

const update = async (req, res) => {
  const record = await table.UserModel.getById(req);
  if (!record) {
    return ErrorHandler({ code: 404, message: "User not exists" });
  }

  const businessRecord = await table.BusinessModel.getByUserId(req.params.id);

  const user = await table.UserModel.update(req);
  const documentsToDelete = [];
  if (businessRecord) {
    const existingLogoDocs = businessRecord.logo;
    const updatedLogoDocs = req.body.logo_urls;
    if (updatedLogoDocs) {
      req.body.logo = [...(req.body?.logo ?? []), ...updatedLogoDocs];
      documentsToDelete.push(
        ...getItemsToDelete(existingLogoDocs, updatedLogoDocs)
      );
    }

    await table.BusinessModel.update(req, businessRecord.id);
  }

  if (user && req.body.password) {
    req.body.new_password = req.body.password;
    await table.UserModel.updatePassword(req, req.user_data.id);
  }

  if (documentsToDelete.length) {
    await cleanupFiles(documentsToDelete);
  }

  return res.send({ status: true, message: "Updated" });
};

const updateStatus = async (req, res) => {
  const record = await table.UserModel.getById(req);
  if (!record) {
    return ErrorHandler({ code: 404, message: "User not exists" });
  }
  const data = await table.UserModel.updateStatus(
    req.params.id,
    req.body.is_active
  );

  res.send({
    status: true,
    message: data?.is_active ? "Customer Active." : "Customer Inactive.",
  });
};

const updatePaymentStatus = async (req, res) => {
  const record = await table.UserModel.getById(req);
  if (!record) {
    return ErrorHandler({ code: 404, message: "User not exists" });
  }
  const data = await table.UserModel.updatePaymentStatus(
    req.params.id,
    req.body.is_payment_received
  );

  res.send({
    status: true,
    message: "Updated",
  });
};

const deleteById = async (req, res) => {
  const record = await table.UserModel.deleteById(req);
  if (record === 0) {
    return ErrorHandler({ code: 404, message: "User not exists" });
  }

  return res.send({ status: true, data: record });
};

const get = async (req, res) => {
  return res.send(await table.UserModel.get(req));
};

const getById = async (req, res) => {
  const record = await table.UserModel.getById(req);
  if (!record) {
    return ErrorHandler({ code: 404, message: "User not exists" });
  }
  delete record.password;

  return res.send({ status: true, record });
};

const updatePassword = async (req, res) => {
  const record = await table.UserModel.getById(req);

  if (!record) {
    return ErrorHandler({ code: 404, message: "User not exists" });
  }

  const verify_old_password = hash.verify(
    req.body.old_password,
    record.password
  );

  if (!verify_old_password) {
    return ErrorHandler({
      code: 404,
      message: "Incorrect password. Please enter a valid password",
    });
  }

  await table.UserModel.updatePassword(req);
  return res.send({
    status: true,
    message: "Password changed successfully!",
  });
};

const checkUsername = async (req, res) => {
  const user = await table.UserModel.getByUsername(req);
  if (user) {
    return ErrorHandler({
      code: 409,
      message: "username already exists try with different username",
    });
  }
  return res.send({
    status: true,
  });
};

const getUser = async (req, res) => {
  const record = await table.UserModel.getById(0, req.user_data.id);
  if (!record) {
    return ErrorHandler({ code: 401, message: "invalid token" });
  }

  return res.send(req.user_data);
};

const resetPassword = async (req, res) => {
  const token = await table.UserModel.getByResetToken(req);
  if (!token) {
    return ErrorHandler({ code: 401, message: "invalid url" });
  }

  await table.UserModel.updatePassword(req, token.id);
  return res.send({
    status: true,
    message: "Password reset successfully!",
  });
};

export default {
  create: create,
  update: update,
  deleteById: deleteById,
  updatePaymentStatus: updatePaymentStatus,
  get: get,
  getById: getById,
  checkUsername: checkUsername,
  updatePassword: updatePassword,
  getUser: getUser,
  resetPassword: resetPassword,
  updateStatus: updateStatus,
  createBusiness: createBusiness,
};
