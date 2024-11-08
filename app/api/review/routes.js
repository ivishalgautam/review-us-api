"use strict";

import controller from "./controller.js";
import { schema } from "./schema.js";

export default async function routes(fastify, opt) {
  fastify.get("/", {}, controller.get);
  fastify.get("/review-card", {}, controller.createReviewCard);
}

export async function publicRoutes(fastify, opt) {
  fastify.post("/", { schema: schema.create }, controller.create);
}
