import { Rez, ServiceResponse } from "@neoncoder/service-response";
import { Request, Response } from "express";

// TODO: Cleanup - We might not be needing these, but still here just in case

export const adminGetSurveysHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const adminSearchSurveysHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const adminCreateSurveyHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const adminUpdateSurveyHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const adminDeleteSurveyHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const adminAssociateSurveyHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const adminDissociateSurveyHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};
