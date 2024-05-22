import { Request, Response } from "express";
import { Rez, ServiceResponse } from "@neoncoder/service-response";
import { QuestionnaireService } from "../services/questionnaire.service";
import { Prisma } from "@prisma/client";
import { SectionService } from "../services/section.service";

export const getQuestionnaireHandler = async (req: Request, res: Response) => {
  const { survey } = res.locals;
  const { include: queryInclude }: { include?: string } = req.query;
  const include: Prisma.QuestionnaireInclude = { _count: { select: { section: true, questions: true } } };
  if (queryInclude) {
    const includes = queryInclude.split(",");
    includes.forEach((i) => {
      if (i === "section" || i === "questions") include[i] = { orderBy: { order: "asc" } };
    });
  }
  console.log({ queryInclude, include });
  const { result } = await new QuestionnaireService({ surveyId: survey.surveyId }).getQuestionnaireById({ include });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const updateQuestionnaireHandler = async (req: Request, res: Response) => {
  const { survey } = res.locals;
  const { result } = await (
    await new QuestionnaireService({ surveyId: survey.surveyId }).getQuestionnaireById({})
  ).updateQuestionnaire({
    updateData: req.body,
    id: survey.surveyId,
  });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const getSectionsHandler = async (req: Request, res: Response) => {
  const { survey } = res.locals;
  const { result } = await new QuestionnaireService({ surveyId: survey.surveyId }).sectionService.getSections({
    filters: { questionnaireId: survey.surveyId },
    orderBy: { order: "asc" },
  });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const addSectionHandler = async (req: Request, res: Response) => {
  const { survey } = res.locals;
  const qService = new QuestionnaireService({ surveyId: survey.surveyId });
  const { result } = await qService.sectionService.createSection({ sectionData: req.body });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const deleteSectionHandler = async (req: Request, res: Response) => {
  const { section } = res.locals;
  const { result } = await new SectionService({ section }).deleteSection({});
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const updateSectionHandler = async (req: Request, res: Response) => {
  const { survey, section } = res.locals;
  const qService = new QuestionnaireService({ surveyId: survey.surveyId });
  if (req.body.order) {
    const count = await qService.sectionService.questionUtils.countSections({
      filters: { questionnaireId: survey.surveyId },
    });
    if (count < req.body.order) {
      const sr = Rez.BadRequest({ message: `Invalid order value`, fix: `Current valid maximum is ${count}` });
      return res.status(sr.statusCode).send(sr);
    }
  }
  const { result } = await qService.sectionService.updateSection({
    updateData: req.body,
    sectionId: section.sectionId,
  });
  const sr: ServiceResponse = Rez[result!.statusType]({ ...result });
  return res.status(sr.statusCode).send(sr);
};

export const getQuestionnaireResponseTypesHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Get questionnaire response types - Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const addQuestionnaireResponseTypeHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Add questionnaire response type - Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};

export const removeQuestionnaireResponseTypeHandler = async (_: Request, res: Response) => {
  const sr: ServiceResponse = Rez.OK({ message: "Remove questionnaire response type - Not yet implemented" });
  return res.status(sr.statusCode).send(sr);
};
