"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable } from "sequelize";

let BusinessModel = null;

const init = async (sequelize) => {
  BusinessModel = sequelize.define(
    constants.models.BUSINESS_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        validate: {
          isUUID: 4,
        },
      },
      business_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Business name is required!" },
        },
      },
      business_link: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Business link is required!" },
          isUrl: true,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await BusinessModel.sync({ alter: true });
};

const create = async (req, user_id) => {
  const data = await BusinessModel.create({
    user_id: user_id,
    business_name: req.body.business_name,
    business_link: req.body.business_link,
  });

  return data.dataValues;
};

const update = async (req, user_id) => {
  return await BusinessModel.update(
    {
      business_name: req.body.business_name,
      business_link: req.body.business_link,
    },
    {
      where: {
        user_id: user_id,
      },
      returning: true,
      raw: true,
    }
  );
};

const getByUserId = async (user_id) => {
  return await BusinessModel.findOne({
    where: {
      user_id: user_id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const getById = async (req, user_id) => {
  return await BusinessModel.findOne({
    where: {
      id: req?.params?.id || user_id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const deleteByUserId = async (user_id) => {
  return await BusinessModel.destroy({
    where: { user_id: user_id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  getByUserId: getByUserId,
  getById: getById,
  deleteByUserId: deleteByUserId,
};
