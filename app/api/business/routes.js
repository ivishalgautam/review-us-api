"use strict";

import controller from "./controller.js";

export default async function routes(fastify, opt) {
  fastify.get("/profile", {}, controller.getBusinessProfile);
}

export async function publicRoutes(fastify, opt) {
  fastify.get("/:id", {}, controller.getById);
}
