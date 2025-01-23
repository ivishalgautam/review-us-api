"use strict";

import hash from "../../lib/encryption/index.js";

import table from "../../db/models.js";
import authToken from "../../helpers/auth.js";
import { ErrorHandler } from "../../helpers/handleError.js";

import { randomBytesGenerator } from "../../lib/encryption/index.js";
import { QrGenerator } from "../../lib/qr-generator.js";
import config from "../../config/index.js";
import { sendEmailWithAttachment } from "../../lib/mailer.js";
import { createImageWithOverlay } from "../../lib/create-canvas.js";

const verifyUserCredentials = async (req, res) => {
  const userData = await table.UserModel.getByUsername(req);

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
  let userData;
  const data = await table.UserModel.create(req);
  userData = await table.UserModel.getById(req, data.id);

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

const createBusiness = async (req, res) => {
  const password = randomBytesGenerator(5);
  console.log({ password });
  req.body.password = password;
  const data = await table.UserModel.create(req);
  if (data) {
    const business = await table.BusinessModel.create(req, data.id);
    console.log({ business });
    const qr = await QrGenerator(
      `${config.qr_base}/reviews/create?businessId=${business.id}&businessLink=${business.business_link}`
    );
    await sendEmailWithAttachment(
      await createImageWithOverlay(business.business_name, qr),
      data.email,
      data.mobile_number,
      password,
      business.business_name
    );
  } else {
    return ErrorHandler({ code: 400, message: "Error creating business!" });
  }

  return res.send({
    status: true,
    message: "Created",
  });
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
