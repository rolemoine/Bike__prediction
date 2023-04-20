import { configSchema } from "./schema";

require("dotenv").config();

const config = {
  db: {
    password: process.env.DB_PWD,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: 3306,
  },
};

export default configSchema.parse(config);
