import { Forbidden, Rez, ServiceResponse } from "@neoncoder/service-response";
import { Request, Response, NextFunction } from "express";
import { SurveyService } from "../services/survey.service";

export const checkUserOwnsSurvey = async (_: Request, res: Response, next: NextFunction) => {
  const userId = res.locals?.user?.userID;
  let sr: ServiceResponse;
  const { clientUserId, creatorUserId } = res.locals.survey;
  if (clientUserId !== userId && creatorUserId !== userId) {
    sr = Forbidden({ message: "You do not have the rights to perform this action" });
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const checkUserOwnsAssociateSurvey = async (_: Request, res: Response, next: NextFunction) => {
  const userId = res.locals?.user?.userID;
  let sr: ServiceResponse;
  const { clientUserId, creatorUserId } = res.locals.associateSurvey;
  if (clientUserId !== userId && creatorUserId !== userId) {
    sr = Forbidden({ message: "You do not have the rights to perform this action" });
    return res.status(sr.statusCode).send(sr);
  }
  return next();
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
