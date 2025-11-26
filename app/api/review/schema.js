export const schema = {
  create: {
    body: {
      type: "object",
      properties: {
        business_id: { type: "string", format: "uuid" },
        rating: { type: "number", minimum: 0 },
        name: { type: "string", minLength: 3 },
        contact_number: { type: "string" },
        body: { type: "string" },
      },
      required: ["business_id", "rating", "name", "contact_number"],
    },
  },
};
