import { NextFunction, Request, Response } from "express";
import { Rez, ServiceResponse } from "@neoncoder/service-response";
import { SurveyService } from "../services/survey.service";
import { Prisma, Survey } from "@prisma/client";

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
  const reverse = req.query.reverse === "true";
  const bi = req.query.bi === "true";
  const { survey, result } = await new SurveyService({ survey: res.locals.survey }).getAssociatedSurveys({
    reverse,
    bi,
  });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result, data: survey });
  return res.status(sr.statusCode).send(sr);
};

export const createSurveyHandler = async (req: Request, res: Response) => {
  const authUserId = res.locals.user.userID;
  const surveyData = req.body;
  surveyData.creatorUserId = authUserId;
  if (!surveyData.clientUserId) surveyData.clientUserId = authUserId;
  const surveyService = new SurveyService({});
  const { result } = await surveyService.createSurvey({ surveyData });
  if (surveyData.associatedSurveys && Array.isArray(surveyData.associatedSurveys) && !result?.error) {
    const notSelf: string[] = surveyData.associatedSurveys.filter((x: string) => surveyService.survey?.surveyId !== x);
    const filters = {
      AND: [{ surveyId: { in: notSelf } }, { OR: [{ creatorUserId: authUserId }, { clientUserId: authUserId }] }],
    };
    const { result } = await surveyService.getAllSurveys({ filters });
    if (result?.data?.count) {
      await surveyService.batchAssociateSurveys({ surveyIds: result.data.surveys.map((x: Survey) => x.surveyId) });
    }
  }
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result, data: surveyService.survey });
  return res.status(sr.statusCode).send(sr);
};

export const updateSurveyHandler = async (req: Request, res: Response) => {
  const result = (await new SurveyService({ survey: res.locals.survey }).updateSurvey(req.body)).result;
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const associateSurveyHandler = async (req: Request, res: Response) => {
  const { associateSurveyId, surveyId } = req.params;
  if (associateSurveyId === surveyId) {
    const sr = Rez.BadRequest({ message: "You cannot link a survey to itself" });
    return res.status(sr.statusCode).send(sr);
  }
  const { result } = await new SurveyService({ survey: res.locals.survey }).associateSurvey({ associateSurveyId });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const dissociateSurveyHandler = async (req: Request, res: Response) => {
  const { associateSurveyId: associatedSurveyId, surveyId } = req.params;
  if (associatedSurveyId === surveyId) {
    const sr = Rez.BadRequest({ message: "You cannot unlink a survey from itself" });
    return res.status(sr.statusCode).send(sr);
  }
  const { result } = await new SurveyService({ survey: res.locals.survey }).dissociateSurvey({ associatedSurveyId });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const deleteSurveyHandler = async (_: Request, res: Response) => {
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

export const checkAssociateSurveyExists = async (
  _: Request,
  res: Response,
  next: NextFunction,
  associateSurveyId: string,
) => {
  const { survey, result } = await new SurveyService({}).getSurveyById({ id: associateSurveyId });
  if (!survey) {
    const sr: ServiceResponse = Rez[result!.statusType]({ ...result, message: "Survey to associate not found" });
    return res.status(sr.statusCode).send(sr);
  }
  res.locals.associateSurvey = survey;
  return next();
};
