"use strict";
import constants from "../../lib/constants/index.js";
import hash from "../../lib/encryption/index.js";
import { DataTypes, QueryTypes } from "sequelize";
import { Op } from "sequelize";
import moment from "moment";

let UserModel = null;

const init = async (sequelize) => {
  UserModel = sequelize.define(
    constants.models.USER_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: true,
          is: { args: /^[0-9A-Za-z]{3,16}$/, msg: "Enter valid username!" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
      },
      mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        unique: {
          args: true,
          msg: "Mobile number already in use!",
        },
      },
      country_code: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      role: {
        type: DataTypes.ENUM({
          values: ["admin", "user"],
        }),
        defaultValue: "user",
        validate: {
          isIn: [["admin", "user"]],
        },
      },
      reset_password_token: {
        type: DataTypes.STRING,
      },
      confirmation_token: {
        type: DataTypes.STRING,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await UserModel.sync({ alter: true });
};

const create = async (req) => {
  const hash_password = hash.encrypt(req.body.password);
  const data = await UserModel.create({
    username: req.body.username,
    password: hash_password,
    email: req.body?.email,
    mobile_number: req.body?.mobile_number,
    country_code: req.body?.country_code.replace(/\s/g, ""),
    role: req.body?.role,
  });

  return data.dataValues;
};

const get = async (req) => {
  const whereConditions = ["usr.role != 'admin'"];
  const queryParams = {};
  const q = req.query.q ? req.query.q : null;

  if (q) {
    whereConditions.push(
      `(usr.fullname ILIKE :query OR usr.email ILIKE :query)`
    );
    queryParams.query = `%${q}%`;
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
    usr.id, usr.mobile_number, usr.email, usr.role, usr.is_active, usr.created_at,
    COUNT(usr.id) OVER()::integer as total
  FROM ${constants.models.USER_TABLE} usr
  ${whereClause}
  LIMIT :limit OFFSET :offset
  `;

  const data = await UserModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  return { data, total: data?.[0]?.total };
};

const getById = async (req, user_id) => {
  return await UserModel.findOne({
    where: {
      id: req?.params?.id || user_id,
    },
    raw: true,
    attributes: [
      "id",
      "username",
      "email",
      "password",
      "is_active",
      "role",
      "mobile_number",
      "country_code",
    ],
  });
};

const getByMobile = async (req, decoded) => {
  return await UserModel.findOne({
    where: {
      mobile_number: req?.body?.mobile_number || decoded.user.mobile_number,
    },
    attributes: [
      "id",
      "username",
      "email",
      "password",
      "is_active",
      "role",
      "mobile_number",
      "country_code",
    ],
    raw: true,
  });
};

const getByUsername = async (req, record = undefined) => {
  return await UserModel.findOne({
    where: {
      username: req?.body?.username || record?.user?.username,
    },
    attributes: [
      "id",
      "username",
      "email",
      "password",
      "is_active",
      "role",
      "mobile_number",
      "country_code",
    ],
  });
};

const update = async (req) => {
  return await UserModel.update(
    {
      username: req.body?.username,
      email: req.body?.email,
      mobile_number: req.body?.mobile_number,
      country_code: req.body?.country_code.replace(/\s/g, ""),

      role: req.body?.role,
    },
    {
      where: {
        id: req.params.id,
      },
      returning: [
        "id",
        "username",
        "email",
        "is_active",
        "role",
        "mobile_number",
        "country_code",
      ],
      plain: true,
    }
  );
};

const updatePassword = async (req, user_id) => {
  const hash_password = hash.encrypt(req.body.new_password);
  return await UserModel.update(
    {
      password: hash_password,
    },
    {
      where: {
        id: req.params?.id || user_id,
      },
    }
  );
};

const deleteById = async (req, user_id) => {
  return await UserModel.destroy({
    where: {
      id: req?.params?.id || user_id,
    },
    returning: true,
    raw: true,
  });
};

const countUser = async (duration) => {
  let whereQuery = { role: "user" };
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

  return await UserModel.count({
    where: whereQuery,
  });
};

const getByEmailId = async (req) => {
  return await UserModel.findOne({
    where: {
      email: req.body.email,
    },
  });
};

const getByResetToken = async (req) => {
  return await UserModel.findOne({
    where: {
      reset_password_token: req.params.token,
    },
  });
};

const getByUserIds = async (user_ids) => {
  return await UserModel.findAll({
    where: {
      id: {
        [Op.in]: user_ids,
      },
    },
  });
};

const updateStatus = async (id, status) => {
  const [rowCount, rows] = await UserModel.update(
    {
      is_active: status,
    },
    {
      where: {
        id: id,
      },
      returning: [
        "id",
        "username",
        "email",
        "is_active",
        "role",
        "mobile_number",
        "country_code",
      ],
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const verify = async ({ user_id, status }) => {
  const [rowCount, rows] = await UserModel.update(
    {},
    {
      where: {
        id: user_id,
      },
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const findUsersWithBirthdayToday = async () => {
  const startIST = moment().startOf("day").toDate();
  const endIST = moment().endOf("day").toDate();

  try {
    const usersWithBirthdayToday = await UserModel.findAll({
      where: {
        birth_date: {
          [Op.between]: [startIST, endIST],
        },
        role: {
          [Op.in]: ["teacher", "student"],
        },
      },
    });

    return usersWithBirthdayToday;
  } catch (error) {
    console.error("Error finding users with birthday today:", error);
    throw error;
  }
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  getByUsername: getByUsername,
  update: update,
  updatePassword: updatePassword,
  deleteById: deleteById,
  countUser: countUser,
  getByEmailId: getByEmailId,
  getByResetToken: getByResetToken,
  getByUserIds: getByUserIds,
  findUsersWithBirthdayToday: findUsersWithBirthdayToday,
  updateStatus: updateStatus,
  verify: verify,
  getByMobile: getByMobile,
};
