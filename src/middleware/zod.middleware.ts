import { BadRequest } from "@neoncoder/service-response";
import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
export const validate =
  (schema: AnyZodObject, schemaName = "Input") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      const sr = BadRequest({
        message: `${schemaName} validation failed`,
        errMessage: error.message,
        error,
      });
      return res.status(sr.statusCode).send(sr);
    }
  };
