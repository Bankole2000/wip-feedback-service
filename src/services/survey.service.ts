import { statusMap } from "@neoncoder/service-response";
import { PrismaClient, Survey, Prisma } from "@prisma/client";
import { PostgresDBService } from "./common.service";
import { isValidDate } from "@neoncoder/validator-utils";
import { AssociatedSurveyService } from "./associatedSurvey.service";
import { AssociatedSurveyFilters, SurveyFilters, SurveyFiltersPaginated } from "./survey.custom.types";
import { SurveyUtilsService } from "./surveyUtils.service";

export class SurveyService extends PostgresDBService {
  survey: (Partial<Survey> & { associatedSurveys?: Survey[]; isAssociatedWithSurveys?: Survey[] }) | null;

  fields: string[];

  associationService: AssociatedSurveyService;

  utilsService: SurveyUtilsService;

  constructor({ survey, prismaInstance }: { survey?: Survey | null; prismaInstance?: PrismaClient }) {
    super(prismaInstance);
    this.survey = survey ?? null;
    this.associationService = new AssociatedSurveyService({ surveyId: survey ? survey.surveyId : undefined });
    this.utilsService = new SurveyUtilsService({ surveyId: survey ? survey.surveyId : undefined });
    this.fields = [
      "surveyId",
      "name",
      "shortDesc",
      "creatorUserId",
      "clientUserId",
      "hasRequestFeedbackEnabled",
      "hasProviderFeedbackEnabled",
      "canViewParticipants",
      "feedbackGiverSurveyThreshold",
      "responsePerQuestionnaireThreshold",
      "requiresSelfAssessment",
      "reportType",
      "published",
      "openingDate",
      "closingDate",
    ];
  }

  async getSurveys({
    page = 1,
    limit = 20,
    filters = {},
    orderBy = { updated: "desc" },
    includes,
  }: SurveyFiltersPaginated) {
    try {
      const [surveys, total] = await this.prisma.$transaction([
        this.prisma.survey.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where: { ...filters },
          orderBy,
          include: {
            _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true, surveyTypes: true } },
          },
        }),
        this.prisma.survey.count({ where: { ...filters } }),
      ]);
      const { pages, prev, next } = this.paginate(total, limit, page);
      const data = { surveys, total, pages, prev, next, meta: { filters, orderBy, includes, page, limit } };
      this.result = statusMap.get(200)!({ data, message: "OK" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async setSurveyId() {
    this.utilsService.surveyId = this.survey?.surveyId;
    this.associationService.surveyId = this.survey?.surveyId;
  }

  async createSurvey({ surveyData }: { surveyData: Prisma.SurveyCreateInput }) {
    const data = this.sanitize(this.fields, surveyData);
    try {
      this.survey = await this.prisma.survey.create({ data });
      if (this.survey.surveyId) this.setSurveyId();
      this.result = statusMap.get(201)!({ data: this.survey, message: "Survey created" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async getSurveyById({ surveyId }: { surveyId: string }) {
    try {
      this.survey = await this.prisma.survey.findUnique({
        where: { surveyId },
        include: { _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true, surveyTypes: true } } },
      });
      if (this.survey?.surveyId) this.associationService.setSurveyId(this.survey.surveyId);
      this.result = this.survey
        ? statusMap.get(200)!({ data: this.survey, message: "OK" })
        : statusMap.get(404)!({ message: `Survey with id - ${surveyId} - not found` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async updateSurvey(updateData: any, surveyId = this.survey?.surveyId) {
    const data = this.sanitize(this.fields, updateData);
    try {
      this.survey = await this.prisma.survey.update({
        where: { surveyId },
        data,
        include: { _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true, surveyTypes: true } } },
      });
      this.associationService.setSurveyId(surveyId!);
      this.result = statusMap.get(200)!({ data: this.survey, message: "Survey updated" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async getAssociatedSurveys({
    bi = false,
    reverse = false,
    surveyId = this.survey?.surveyId,
  }: AssociatedSurveyFilters) {
    try {
      const {
        data: { surveys: data },
      } = (await this.associationService.getAllAssociatedSurveys({ bi, reverse, surveyId })).result!;
      if (this.survey) this.survey.associatedSurveys = data;
      this.result = statusMap.get(200)!({
        data: { survey: this.survey, meta: { reverse, bi } },
        message: "Associated Surveys",
      });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async deleteSurvey({ surveyId = this.survey?.surveyId }: { surveyId?: string }) {
    try {
      const deletedSurvey = await this.prisma.survey.delete({
        where: { surveyId },
      });
      this.survey = null;
      this.result = statusMap.get(200)!({ data: deletedSurvey, message: `Survey deleted` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async getAllSurveys({ filters, orderBy = { updated: "desc" }, includes }: SurveyFilters) {
    try {
      const [surveys, count] = await this.prisma.$transaction([
        this.prisma.survey.findMany({
          where: { ...filters },
          orderBy,
          include: this.getIncludes(includes),
        }),
        this.prisma.survey.count({ where: { ...filters } }),
      ]);
      this.result = statusMap.get(200)!({ data: { surveys, count, meta: { filters, orderBy } }, message: "OK" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  buildQueryFilters(query: any, isAdmin = false) {
    const OR: { [key: string]: any }[] = [];
    for (const key in query) {
      if (![...this.fields, "created", "updated"].includes(key)) continue;
      if (key === "q") continue;
      if (["true", "false"].includes(String(query[key]))) {
        OR.push({ [key]: String(query[key]) === "true" });
        continue;
      }
      if ((key === "clientUserId" || key === "creatorUserId") && isAdmin) {
        OR.push({ [key]: String(query[key]) });
        continue;
      }
      if (["created", "updated", "openingDate", "closingDate"].includes(key)) {
        const data = String(query[key]);
        const bf = data.charAt(0) === "-";
        if (isValidDate(bf ? data.substring(1) : data)) {
          bf ? OR.push({ [key]: { lte: new Date(data.substring(1)) } }) : OR.push({ [key]: { gte: new Date(data) } });
          continue;
        }
      }
      OR.push({ [key]: query[key] });
    }
    return OR;
  }

  getIncludes(includes?: Prisma.SurveyInclude) {
    const countInclude: Prisma.SurveyInclude = {
      _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true, surveyTypes: true } },
    };
    return { ...countInclude, ...includes };
  }
}
