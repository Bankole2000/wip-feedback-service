import { Forbidden, Rez, ServiceResponse, statusMap } from "@neoncoder/service-response";
import { Request, Response, NextFunction } from "express";
import { SurveyService } from "../services/survey.service";
import { SectionService } from "../services/section.service";
import { ResponseTypeService } from "../services/responseType.service";

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

export const checkSurveyExists = async (_: Request, res: Response, next: NextFunction, surveyId: string) => {
  const { survey, result } = await new SurveyService({}).getSurveyById({ surveyId });
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
  const { survey, result } = await new SurveyService({}).getSurveyById({ surveyId: associateSurveyId });
  if (!survey) {
    const sr: ServiceResponse = Rez[result!.statusType]({ ...result, message: "Survey to associate not found" });
    return res.status(sr.statusCode).send(sr);
  }
  res.locals.associateSurvey = survey;
  return next();
};

export const checkSectionExists = async (_: Request, res: Response, next: NextFunction, sectionId: string) => {
  const { section, result } = await new SectionService({}).getSectionDetails({ sectionId });
  if (!section) {
    const sr: ServiceResponse = Rez[result!.statusType]({ ...result, message: "Section not found" });
    return res.status(sr.statusCode).send(sr);
  }
  res.locals.section = section;
  return next();
};

export const checkResponseTypeExists = async (
  _: Request,
  res: Response,
  next: NextFunction,
  responseTypeId: string,
) => {
  if (!responseTypeId || !Number.isInteger(Number(responseTypeId))) {
    const result = statusMap.get(400)!({ message: "Invalid responseTypeId" });
    const sr: ServiceResponse = Rez[result!.statusType]({ ...result, message: "Response Type not found" });
    return res.status(sr.statusCode).send(sr);
  }
  const { responseType, result } = await new ResponseTypeService({}).getResponseTypeById({
    id: Number(responseTypeId),
  });
  const { role } = res.locals.user;
  if (!responseType) {
    const sr: ServiceResponse = Rez[result!.statusType]({ ...result, message: "Response Type not found" });
    return res.status(sr.statusCode).send(sr);
  }
  if (!responseType.createdByUserId && role !== "admin") {
    const result = statusMap.get(403)!({ message: "This is a system response type" });
    const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
    return res.status(sr.statusCode).send(sr);
  }
  res.locals.responseType = responseType;
  return next();
};
