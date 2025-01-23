"use strict";
import controller from "./controller.js";
import userController from "../users/controller.js";
import { schema } from "./schema.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/login/admin",
    { schema: schema.loginAdmin },
    controller.verifyUserCredentials
  );
  fastify.post(
    "/login/business",
    { schema: schema.loginBusiness },
    controller.verifyBusinessCredentials
  );
  fastify.post(
    "/register",
    { schema: schema.signup },
    controller.createNewUser
  );
  fastify.post(
    "/register/business",
    { schema: schema.signupBusiness },
    controller.createBusiness
  );
  fastify.post("/refresh", {}, controller.verifyRefreshToken);
  fastify.post("/username", {}, userController.checkUsername);
  fastify.post("/:token", {}, userController.resetPassword);
}
