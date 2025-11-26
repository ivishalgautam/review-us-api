"use strict";

import hash from "../../lib/encryption/index.js";

import table from "../../db/models.js";
import authToken from "../../helpers/auth.js";
import { ErrorHandler } from "../../helpers/handleError.js";

import { randomBytesGenerator } from "../../lib/encryption/index.js";
import { QrGenerator } from "../../lib/qr-generator.js";
import config from "../../config/index.js";
import { sendEmailWithAttachment } from "../../lib/mailer.js";
import { sequelize } from "../../db/postgres.js";
import { createA5PdfWithOverlay } from "../../lib/create-a5-pdf.js";
import path from "path";
import fs from "fs";

const verifyUserCredentials = async (req, res) => {
  const userData = await table.UserModel.getByUsername(req);

  if (!userData) {
    return ErrorHandler({ code: 404, message: "User not found!" });
  }

  if (userData.role !== "admin") {
    if (!userData.is_active) {
      return ErrorHandler({
        code: 400,
        message: "User not active. Please contact administrator!",
      });
    }

    if (!userData.is_payment_received) {
      return ErrorHandler({
        code: 400,
        message: "Your payment is not completed. Please contact administrator!",
      });
    }
  }

  let passwordIsValid = hash.verify(req.body.password, userData.password);

  if (!passwordIsValid) {
    return ErrorHandler({ code: 400, message: "Invalid credentials" });
  }

  const [jwtToken, expiresIn] = authToken.generateAccessToken(userData);
  const refreshToken = authToken.generateRefreshToken(userData);

  return res.send({
    status: true,
    token: jwtToken,
    expire_time: Date.now() + expiresIn,
    refresh_token: refreshToken,
    user_data: userData,
  });
};

const verifyBusinessCredentials = async (req, res) => {
  const userData = await table.UserModel.getByMobile(req);
  if (!userData) {
    return ErrorHandler({ code: 404, message: "User not found!" });
  }

  if (!userData.is_active) {
    return ErrorHandler({
      code: 400,
      message: "User not active. Please contact administrator!",
    });
  }

  let passwordIsValid = hash.verify(req.body.password, userData.password);
  if (!passwordIsValid) {
    return ErrorHandler({ code: 400, message: "Invalid credentials" });
  }

  const [jwtToken, expiresIn] = authToken.generateAccessToken(userData);
  const refreshToken = authToken.generateRefreshToken(userData);

  return res.send({
    status: true,
    token: jwtToken,
    expire_time: Date.now() + expiresIn,
    refresh_token: refreshToken,
    user_data: userData,
  });
};

const createNewUser = async (req, res) => {
  try {
    const transaction = await sequelize.transaction();
    let userData;
    const data = await table.UserModel.create(req, { transaction });
    userData = await table.UserModel.getById(req, data.id);

    const [jwtToken, expiresIn] = authToken.generateAccessToken(userData);
    const refreshToken = authToken.generateRefreshToken(userData);

    await transaction.commit();

    return res.send({
      status: true,
      token: jwtToken,
      expire_time: Date.now() + expiresIn,
      refresh_token: refreshToken,
      user_data: userData,
    });
  } catch (error) {
    res.send(500).message({ status: false, message: error.message, error });
  }
};

const createBusiness = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const password = randomBytesGenerator(5);
    req.body.password = password;
    const data = await table.UserModel.create(req, { transaction });
    if (data) {
      const business = await table.BusinessModel.create(req, data.id, {
        transaction,
      });
      const qr = await QrGenerator(
        `${config.qr_base}/reviews/create?businessId=${business.id}&businessLink=${business.business_link}`
      );

      const logoPath = path.join(process.cwd(), business.logo[0]);
      const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
      const fileBuffer = await createA5PdfWithOverlay(qr, logoBase64);

      await sendEmailWithAttachment({
        imageBuffer: fileBuffer,
        toMail: data.email,
        username: data.mobile_number,
        password: password,
        businessName: business.business_name,
      });
    } else {
      return ErrorHandler({ code: 400, message: "Error creating business!" });
    }

    await transaction.commit();
    return res.send({
      status: true,
      message: "Created",
    });
  } catch (error) {
    await transaction.rollback();
    return ErrorHandler({ code: 500, message: error.message });
  }
};

const verifyRefreshToken = async (req, res) => {
  // console.log({ cookies: req.cookies });
  return authToken.verifyRefreshToken(req, res);
};

export default {
  verifyUserCredentials: verifyUserCredentials,
  verifyBusinessCredentials: verifyBusinessCredentials,
  createNewUser: createNewUser,
  createBusiness: createBusiness,
  verifyRefreshToken: verifyRefreshToken,
};
