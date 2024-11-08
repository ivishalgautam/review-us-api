import { publicRoutes as businessRoutes } from "../../api/business/routes.js";
import { publicRoutes as reviewRoutes } from "../../api/review/routes.js";

export default async function routes(fastify, options) {
  fastify.register(businessRoutes, { prefix: "business" });
  fastify.register(reviewRoutes, { prefix: "reviews" });
}
