import { Request, Response, NextFunction, RequestHandler } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validateRequest = (schema: AnyZodObject): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};
