import { Response, Request } from "express";
import { ServiceResponse, Rez } from "@neoncoder/service-response";

export const addScaleOptionHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const deleteScaleOptionHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const getScaleOptionsHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const updateScaleOptionHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};
