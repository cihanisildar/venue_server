import { Request, Response, NextFunction } from "express";

export const validateInternalRequest = (req: Request, res: Response, next: NextFunction): void => {
  const internalSecret = req.header("X-Internal-Secret");

  if (!internalSecret || internalSecret !== process.env.INTERNAL_SECRET) {
    console.error("Unauthorized internal request - Invalid or missing secret");
    res.status(401).json({ message: "Unauthorized - Invalid internal secret" });
    return; // Ensure the function stops execution here
  }

  next(); // Proceed to the next middleware or controller
};
