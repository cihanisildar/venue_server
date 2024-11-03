// src/api-gateway/schemas/auth.schemas.ts
import { z } from 'zod';


export const authSchemas = {
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
  }),
  register: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
      username: z.string().min(2), 
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
  }),
};

export const loginUserSchema = authSchemas.login;
export const registerUserSchema = authSchemas.register;
