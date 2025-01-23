export const schema = {
  signup: {
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
  signupBusiness: {
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
  loginAdmin: {
    body: {
      type: "object",
      properties: {
        username: { type: "string" },
        password: { type: "string" },
      },
      required: ["username", "password"],
    },
  },
  loginBusiness: {
    body: {
      type: "object",
      properties: {
        mobile_number: { type: "string" },
        password: { type: "string" },
      },
      required: ["mobile_number", "password"],
    },
  },
  otpSend: {
    body: {
      type: "object",
      properties: {
        mobile_number: { type: "string" },
        country_code: { type: "string" },
      },
      required: ["mobile_number", "country_code"],
    },
  },
  otpVerify: {
    body: {
      type: "object",
      properties: {
        mobile_number: { type: "string" },
        otp: { type: "string", minLength: 6, maxLength: 6 },
      },
      required: ["mobile_number", "otp"],
    },
  },
};
