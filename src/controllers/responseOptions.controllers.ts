import { Response, Request } from "express";
import { ServiceResponse, Rez } from "@neoncoder/service-response";

export const addScaleOptionHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "add scale optionsNot yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const deleteScaleOptionHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Delete scale option Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const getScaleOptionsHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Get scale options - Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const updateScaleOptionHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Update Scale options - Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const getScaleOptionTemplatesHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Get Scale Options Templates - Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const useScaleOptionTemplatesHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Use Scale Options Template - Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};
