"use strict";
import moment from "moment";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, Op, QueryTypes } from "sequelize";

let ReviewModel = null;

const init = async (sequelize) => {
  ReviewModel = sequelize.define(
    constants.models.REVIEWS_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      business_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.BUSINESS_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        validate: {
          isUUID: 4,
        },
      },
      rating: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Rating is required!" },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Name is required!" },
        },
      },
      contact_number: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Contact number is required!" },
        },
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await ReviewModel.sync({ alter: true });
};

const create = async (req, user_id) => {
  return await ReviewModel.create({
    business_id: req.body.business_id,
    rating: req.body.rating,
    name: req.body.name,
    contact_number: req.body.contact_number,
    body: req.body.body,
  });
};

const get = async (req) => {
  const whereConditions = [];
  let queryParams = {};
  const { role, id } = req.user_data;

  const q = req.query.q;

  if (role === "user") {
    whereConditions.push(`usr.id = :userId`);
    queryParams.userId = id;
  }

  if (q) {
    whereConditions.push(`rvw.name ILIKE :q`);
    queryParams.q = `%${q}%`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  const query = `
    SELECT
        rvw.*,
        COUNT(rvw.id) OVER()::integer as total
       FROM ${constants.models.REVIEWS_TABLE} rvw
       LEFT JOIN ${constants.models.BUSINESS_TABLE} bsns ON bsns.id = rvw.business_id
       LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = bsns.user_id
       ${whereClause}
       ORDER BY rvw.created_at
       LIMIT :limit OFFSET :offset
  `;

  const data = await ReviewModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: { ...queryParams, limit, offset },
    raw: true,
  });

  return { data: data, total: data?.[0]?.total ?? 0 };
};

const getByBusinessId = async (req, business_id) => {
  return await ReviewModel.findOne({
    where: {
      business_id: req?.params?.id || business_id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const deleteById = async (user_id) => {
  return await ReviewModel.destroy({
    where: { user_id: user_id },
  });
};

const countReview = async (businessId, duration) => {
  let whereQuery = { business_id: businessId };

  if (duration === "lastMonth") {
    whereQuery.created_at = {
      [Op.gte]: moment().subtract(1, "months").startOf("month").toDate(),
      [Op.lt]: moment().startOf("month").toDate(),
    };
  }

  if (duration === "currMonth") {
    whereQuery.created_at = {
      [Op.gte]: moment().startOf("month").toDate(),
      [Op.lt]: moment().endOf("month").toDate(),
    };
  }

  return await ReviewModel.count({
    where: whereQuery,
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getByBusinessId: getByBusinessId,
  deleteById: deleteById,
  countReview: countReview,
};
