import { Request, Response } from "express";
import { Rez, ServiceResponse } from "@neoncoder/service-response";
import { SurveyService } from "../services/survey.service";
import { Prisma, Survey, SurveyType } from "@prisma/client";
import { isNotEmpty } from "@neoncoder/validator-utils";

export const getSurveysHandler = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) ? parseInt(req.query.limit as string, 10) : 25;
  const page = parseInt(req.query.page as string, 10) ? parseInt(req.query.page as string, 10) : 1;
  const { userID: userId, role } = res.locals.user;
  let filters: Prisma.SurveyWhereInput | undefined = {};
  const surveyService = new SurveyService({});
  const authFilter =
    role === "admin" ? undefined : userId ? { OR: [{ creatorUserId: userId }, { clientUserId: userId }] } : {};
  if (Object.keys(req.query).length) {
    const OR: { [key: string]: any }[] = surveyService.buildQueryFilters(req.query, role === "admin");
    filters.AND = authFilter ? [...OR, authFilter] : [...OR];
  } else {
    filters = authFilter;
  }
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
  const surveyService = new SurveyService({});
  const OR: { [key: string]: any }[] = surveyService.buildQueryFilters(req.query, role === "admin");
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
  const { associatedSurveys, surveyTypes } = surveyData;
  if (surveyTypes && Array.isArray(surveyTypes) && !result?.error) {
    const typeFilters = { page: 1, limit: 20, filters: { surveyType: { in: [...surveyTypes, "SELF"] } } };
    const { data } = (await surveyService.utilsService.getTypes(typeFilters)).result!;
    data.surveyTypes.forEach(async (type: SurveyType) => {
      await surveyService.utilsService.addSurveyType({ surveyType: type.surveyType });
    });
  } else {
    await surveyService.utilsService.addSurveyType({ surveyType: "SELF" });
  }
  if (associatedSurveys && Array.isArray(associatedSurveys) && !result?.error) {
    const notSelf = [...new Set(associatedSurveys.filter((x: string) => surveyService.survey?.surveyId !== x))];
    const filters = {
      AND: [{ surveyId: { in: notSelf as string[] } }, { OR: [{ creatorUserId: userId }, { clientUserId: userId }] }],
    };
    const { result } = await surveyService.getAllSurveys({ filters });
    if (result?.data?.count) {
      await surveyService.associationService.batchCreateAssociations({
        surveyIds: result.data.surveys.map((x: Survey) => x.surveyId),
      });
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
  const { surveyTypes, ...rest } = req.body;
  const { survey } = res.locals;
  const surveyService = new SurveyService({ survey });
  const data: Record<string, unknown> = { ...rest };
  if (surveyTypes && Array.isArray(surveyTypes)) {
    const typeFilters = { page: 1, limit: 20, filters: { surveyType: { in: [...surveyTypes, "SELF"] } } };
    const { surveyTypes: types } = (await surveyService.utilsService.getTypes(typeFilters)).result!.data;
    // data.surveyTypes = types.map((x: SurveyType) => ({ surveyType: x.surveyType, surveyId: survey?.surveyId }));
    const updatedSurveyTypes: string[] = types.map((x: SurveyType) => x.surveyType);
    await surveyService.utilsService.removeAllSurveyTypes({});
    await surveyService.utilsService.batchAddSurveyType({ surveyTypes: updatedSurveyTypes });
  }
  const result = (await surveyService.updateSurvey(data)).result;
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const associateSurveyHandler = async (req: Request, res: Response) => {
  const { associateSurveyId, surveyId } = req.params;
  if (associateSurveyId === surveyId) {
    const sr = Rez.BadRequest({ message: "You cannot link a survey to itself" });
    return res.status(sr.statusCode).send(sr);
  }
  const { result } = await new SurveyService({ survey: res.locals.survey }).associationService.createAssociation({
    associatedSurveyId: associateSurveyId,
  });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const dissociateSurveyHandler = async (req: Request, res: Response) => {
  const { bi } = req.query;
  const { associateSurveyId: associatedSurveyId, surveyId } = req.params;
  if (associatedSurveyId === surveyId) {
    const sr = Rez.BadRequest({ message: "You cannot unlink a survey from itself" });
    return res.status(sr.statusCode).send(sr);
  }
  const { result } = await new SurveyService({ survey: res.locals.survey }).associationService.deleteSurveyAssociation({
    bi: bi === "true",
    associatedSurveyId,
  });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const getAssociatedSurveysHandler = async (req: Request, res: Response) => {
  const { bi, reverse } = req.query;
  const { result } = await new SurveyService({ survey: res.locals.survey }).associationService.getAllAssociatedSurveys({
    bi: bi === "true",
    reverse: reverse === "true",
  });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const deleteSurveyHandler = async (_: Request, res: Response) => {
  const result = (await new SurveyService({ survey: res.locals.survey }).deleteSurvey({})).result;
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};
