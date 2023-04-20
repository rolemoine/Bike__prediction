import { z } from "zod";

const configSchema = z.object({
  db: z.object({
    password: z.string(),
    user: z.string(),
    host: z.string(),
    port: z.number(),
  }),
});

export { configSchema };
