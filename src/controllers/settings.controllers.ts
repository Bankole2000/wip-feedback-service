import { Request, Response } from "express";
import { Rez, ServiceResponse, statusMap } from "@neoncoder/service-response";
import { ResponseTypeService } from "../services/responseType.service";
import { SurveyUtilsService } from "../services/surveyUtils.service";
import { optionTemplates } from "../utils/templates";

export const getDefaultSettingsHandler = async (req: Request, res: Response) => {
  const { custom } = req.query;
  const userId = res.locals.user.userID;
  const rtService = new ResponseTypeService({});
  const suService = new SurveyUtilsService({});
  const resData: Record<string, unknown> = {};
  const { responseTypes } = (
    await rtService.getResponseTypes({ page: 1, limit: 100, filters: { createdByUserId: null } })
  ).result!.data;
  const { surveyTypes } = (await suService.getTypes({ page: 1, limit: 100, filters: { createdByUserId: null } }))
    .result!.data;
  if (custom === "true") {
    const { responseTypes: customResponseTypes } = (
      await rtService.getResponseTypes({ page: 1, limit: 100, filters: { createdByUserId: userId } })
    ).result!.data;
    const { surveyTypes: customSurveyTypes } = (
      await suService.getTypes({ page: 1, limit: 100, filters: { createdByUserId: userId } })
    ).result!.data;
    resData.customResponseTypes = customResponseTypes;
    resData.customSurveyTypes = customSurveyTypes;
  }
  resData.optionTemplates = optionTemplates;
  resData.responseTypes = responseTypes;
  resData.surveyTypes = surveyTypes;
  const result = statusMap.get(200)!({ data: resData, message: "Survey Settings" });

  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const createResponseTypeHandler = async (req: Request, res: Response) => {
  const { userID: userId, role } = res.locals.user;
  const rtService = new ResponseTypeService({});
  const isSystem = role === "admin" && req.body.isSystem;
  const createdByUserId = isSystem ? null : userId;
  const responseTypeId = createdByUserId ? `${Date.now()}` : req.body.responseType;
  const data = { createdByUserId, ...req.body, responseTypeId };
  const { result } = await rtService.createResponseType({ responseTypeData: data, isSystem });
  console.log({ result });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const getResponseTypesHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const getSurveyTypesHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};
