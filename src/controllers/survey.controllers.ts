import { Request, Response } from "express";
import { Rez, ServiceResponse } from "@neoncoder/service-response";
import { SurveyService } from "../services/survey.service";
import { Prisma, Survey } from "@prisma/client";
import { isNotEmpty, isValidDate } from "@neoncoder/validator-utils";

export const getSurveysHandler = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) ? parseInt(req.query.limit as string, 10) : 25;
  const page = parseInt(req.query.page as string, 10) ? parseInt(req.query.page as string, 10) : 1;
  const { userID: userId, role } = res.locals.user;
  const filters =
    role === "admin" ? undefined : userId ? { OR: [{ creatorUserId: userId }, { clientUserId: userId }] } : {};
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
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result, data: survey, message: "Survey Details" });
  return res.status(sr.statusCode).send(sr);
};

export const searchSurveysHandler = async (req: Request, res: Response) => {
  const { q } = req.query;
  const { userID: userId, role } = res.locals.user;
  const filters: Prisma.SurveyWhereInput | undefined = {};
  const OR: { [key: string]: any }[] = [];
  const surveyService = new SurveyService({});
  for (const key in req.query) {
    if (![...surveyService.fields, "created", "updated"].includes(key)) continue;
    if (key === "q") continue;
    if (["true", "false"].includes(String(req.query[key]))) {
      OR.push({ [key]: String(req.query[key]) === "true" });
      continue;
    }
    if ((key === "clientUserId" || key === "creatorUserId") && role === "admin") {
      OR.push({ [key]: String(req.query[key]) });
      continue;
    }
    if (["created", "updated", "openingDate", "closingDate"].includes(key)) {
      const data = String(req.query[key]);
      const bf = data.charAt(0) === "-";
      if (isValidDate(bf ? data.substring(1) : data)) {
        bf ? OR.push({ [key]: { lte: new Date(data.substring(1)) } }) : OR.push({ [key]: { gte: new Date(data) } });
        continue;
      }
    }
    OR.push({ [key]: req.query[key] });
  }
  if (role !== "admin") OR.push({ OR: [{ creatorUserId: userId }, { clientUserId: userId }] });
  if (q && isNotEmpty(String(q))) {
    filters.AND = [
      {
        OR: [
          { shortDesc: { contains: String(q), mode: "insensitive" } },
          { name: { contains: String(q), mode: "insensitive" } },
        ],
      },
      ...OR,
    ];
  } else {
    filters.AND = [...OR];
  }
  const { result } = await surveyService.getAllSurveys({ filters });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const createSurveyHandler = async (req: Request, res: Response) => {
  const userId = res.locals.user.userID;
  const surveyData = req.body;
  surveyData.creatorUserId = userId;
  if (!surveyData.clientUserId) surveyData.clientUserId = userId;
  const surveyService = new SurveyService({});
  const { result } = await surveyService.createSurvey({ surveyData });
  const { associatedSurveys } = surveyData;
  if (associatedSurveys && Array.isArray(associatedSurveys) && !result?.error) {
    const notSelf = [...new Set(associatedSurveys.filter((x: string) => surveyService.survey?.surveyId !== x))];
    const filters = {
      AND: [{ surveyId: { in: notSelf as string[] } }, { OR: [{ creatorUserId: userId }, { clientUserId: userId }] }],
    };
    const { result } = await surveyService.getAllSurveys({ filters });
    if (result?.data?.count) {
      await surveyService.batchAssociateSurveys({ surveyIds: result.data.surveys.map((x: Survey) => x.surveyId) });
    }
  }
  const sr: ServiceResponse = Rez[result!.statusType]({
    ...result,
    data: surveyService.survey,
    message: result?.statusType === "OK" ? "Survey Created" : result?.message,
  });
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
