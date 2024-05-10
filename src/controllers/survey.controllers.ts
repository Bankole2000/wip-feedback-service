import { NextFunction, Request, Response } from "express";
import { Rez, ServiceResponse } from "@neoncoder/service-response";
import { SurveyService } from "../services/survey.service";
import { Prisma } from "@prisma/client";

export const getSurveysHandler = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) ? parseInt(req.query.limit as string, 10) : 25;
  const page = parseInt(req.query.page as string, 10) ? parseInt(req.query.page as string, 10) : 1;
  const userId = res.locals?.user?.userID;
  const filters = userId ? { OR: [{ creatorUserId: userId }, { clientUserId: userId }] } : {};
  const orderBy = { updated: "desc" as Prisma.SortOrder };
  const query = { page, limit, filters, orderBy };
  const result = await new SurveyService({}).getSurveys(query).then((SS) => SS.result);
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const getSurveyDetailsHandler = async (req: Request, res: Response) => {
  const result = (await new SurveyService({ survey: res.locals.survey }).getAssociatedSurveys({})).result;
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const createSurveyHandler = async (req: Request, res: Response) => {
  const authUserId = res.locals.user.userID;
  const surveyData = req.body;
  surveyData.creatorUserId = authUserId;
  if (!surveyData.clientUserId) surveyData.clientUserId = authUserId;
  const result = (await new SurveyService({}).createSurvey(surveyData)).result;
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const updateSurveyHandler = async (req: Request, res: Response) => {
  const result = (await new SurveyService({ survey: res.locals.survey }).updateSurvey(req.body)).result;
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const deleteSurveyHandler = async (req: Request, res: Response) => {
  const result = (await new SurveyService({ survey: res.locals.survey }).deleteSurvey({})).result;
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const checkSurveyExists = async (req: Request, res: Response, next: NextFunction, surveyId: string) => {
  const { survey, result } = await new SurveyService({}).getSurveyById({ id: surveyId });
  if (!survey) {
    const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
    return res.status(sr.statusCode).send(sr);
  }
  res.locals.survey = survey;
  return next();
};
