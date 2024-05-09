import { Request, Response } from "express";
import { Rez, ServiceResponse } from "@neoncoder/service-response";
import { SurveyService } from "../services/survey.service";

export const getSurveysHandler = async (req: Request, res: Response) => {
  const result = await new SurveyService().getSurveys({}).then((SS) => SS.result);
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};
