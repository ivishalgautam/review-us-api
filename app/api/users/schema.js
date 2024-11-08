export const schema = {
  create: {
    body: {
      type: "object",
      properties: {
        username: { type: "string", minLength: 3 },
        password: { type: "string", minLength: 3 },
        email: { type: "string", minLength: 3 },
        mobile_number: { type: "string", minLength: 3 },
        country_code: { type: "string", minLength: 1 },
      },
      required: [
        "username",
        "password",
        "email",
        "mobile_number",
        "country_code",
      ],
    },
  },
  createBusiness: {
    body: {
      type: "object",
      properties: {
        email: { type: "string", minLength: 3 },
        mobile_number: { type: "string", minLength: 3 },
        country_code: { type: "string", minLength: 1 },
        business_name: { type: "string", minLength: 1 },
        business_link: { type: "string", minLength: 1 },
      },
      required: [
        "email",
        "mobile_number",
        "country_code",
        "business_name",
        "business_link",
      ],
    },
  },
  checkParam: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
    },
    required: ["id"],
  },
};
