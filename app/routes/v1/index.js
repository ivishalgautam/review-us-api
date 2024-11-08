import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import otpRoutes from "../../api/otp/routes.js";
import businessRoutes from "../../api/business/routes.js";
import reviewRoutes from "../../api/review/routes.js";
import dashboardRoutes from "../../api/dashboard/routes.js";

export default async function routes(fastify, options) {
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(otpRoutes, { prefix: "otp" });
  fastify.register(businessRoutes, { prefix: "business" });
  fastify.register(reviewRoutes, { prefix: "reviews" });
  fastify.register(dashboardRoutes, { prefix: "reports" });
}
