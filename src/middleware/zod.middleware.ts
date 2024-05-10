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
      console.log({ error: error["issues"] });
      let message: string;
      if (error["issues"]) {
        const path: string[] = error["issues"][0]["path"];
        message = `${path.length > 1 ? path[path.length - 1] : "Error"} - ${error["issues"][0]["message"]}`;
      } else {
        message = JSON.parse(error).message;
      }
      const errorFormat = { ...error, message };
      const sr = BadRequest({
        message: `${schemaName} validation failed`,
        error: errorFormat,
      });
      return res.status(sr.statusCode).send(sr);
    }
  };
