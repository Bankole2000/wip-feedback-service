import { Rez, ServiceResponse } from "@neoncoder/service-response";
import { Request, Response } from "express";

export const defaultHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const notFoundHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.NotFound({});
  return res.status(sr.statusCode).send(sr);
};
