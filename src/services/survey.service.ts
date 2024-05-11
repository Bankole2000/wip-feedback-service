import { statusMap } from "@neoncoder/service-response";
import { PrismaClient, Survey, Prisma } from "@prisma/client";
import { PostgresDBService } from "./common.service";
import { isValidDate } from "@neoncoder/validator-utils";

// TODO: Refactor - survey associations should be in their own DBAL Class extending this one

export class SurveyService extends PostgresDBService {
  survey: (Partial<Survey> & { associatedSurveys?: Survey[]; isAssociatedWithSurveys?: Survey[] }) | null;

  fields: string[];

  constructor({ survey, prismaInstance }: { survey?: Survey | null; prismaInstance?: PrismaClient }) {
    super(prismaInstance);
    this.survey = survey ?? null;
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
  }: {
    page: number;
    limit: number;
    filters: Prisma.SurveyWhereInput | undefined;
    orderBy: Prisma.SurveyOrderByWithRelationInput | Prisma.SurveyOrderByWithRelationInput[] | undefined;
  }) {
    try {
      const [surveys, total] = await this.prisma.$transaction([
        this.prisma.survey.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where: { ...filters },
          orderBy,
          include: { _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true } } },
        }),
        this.prisma.survey.count({ where: { ...filters } }),
      ]);
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      const data = { surveys, total, pages, prev, next, meta: { filters, orderBy, page, limit } };
      this.result = statusMap.get(200)!({ data, message: "OK" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async createSurvey({ surveyData }: { surveyData: Prisma.SurveyCreateInput }) {
    const data = this.sanitize(this.fields, surveyData);
    try {
      this.survey = await this.prisma.survey.create({ data });
      this.result = statusMap.get(201)!({ data: this.survey, message: "Survey created" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async getSurveyById({ id }: { id: string }) {
    try {
      this.survey = await this.prisma.survey.findUnique({
        where: { surveyId: id },
        include: { _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true } } },
      });
      this.result = this.survey
        ? statusMap.get(200)!({ data: this.survey, message: "OK" })
        : statusMap.get(404)!({ message: `Survey with id - ${id} - not found` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async updateSurvey(updateData: any, id?: string) {
    const surveyId = id ?? this.survey?.surveyId;
    const data = this.sanitize(this.fields, updateData);
    try {
      this.survey = await this.prisma.survey.update({ where: { surveyId }, data });
      this.result = statusMap.get(200)!({ data: this.survey, message: "Survey updated" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async batchAssociateSurveys({ surveyIds, id = undefined }: { surveyIds: string[]; id?: string }) {
    const surveyId = id ?? this.survey?.surveyId;
    const data: { surveyId: string; associatedSurveyId: string }[] = [];
    surveyIds.forEach((id) => {
      id !== surveyId && surveyId ? data.push({ surveyId, associatedSurveyId: id }) : null;
    });
    try {
      if (!data.length) {
        this.result = statusMap.get(400)!({ message: "Invalid survey Ids to associate" });
      } else {
        const result = await this.prisma.associatedSurvey.createMany({
          data,
          skipDuplicates: true,
        });
        if (!id) {
          this.survey = await this.prisma.survey.findUnique({
            where: { surveyId },
            include: { _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true } } },
          });
        }
        this.result = statusMap.get(201)!({ message: `${result.count} Surveys associated`, data: this.survey });
      }
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async checkSurveyAssociation({
    associatedSurveyId,
    id = undefined,
    bi = false,
  }: {
    associatedSurveyId: string;
    id?: string;
    bi?: boolean;
  }) {
    const surveyId = id ?? this.survey?.surveyId;
    const filter = bi
      ? {
          OR: [
            { associatedSurveyId, surveyId },
            { surveyId: associatedSurveyId, associatedSurveyId: surveyId },
          ],
        }
      : { AND: [{ surveyId, associatedSurveyId }] };
    try {
      const existingAssociation = await this.prisma.associatedSurvey.findFirst({ where: { ...filter } });
      this.result = existingAssociation
        ? statusMap.get(200)!({ data: existingAssociation, message: "These surveys are already associated" })
        : statusMap.get(404)!({ data: null, message: `These surveys are not associated` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async associateSurvey({ associateSurveyId, id = undefined }: { associateSurveyId: string; id?: string }) {
    const surveyId = id ?? this.survey?.surveyId;
    try {
      const { result: check } = await this.checkSurveyAssociation({
        associatedSurveyId: associateSurveyId,
        id: surveyId,
      });
      if (check?.statusType !== "OK") {
        await this.prisma.associatedSurvey.create({
          data: {
            surveyId: surveyId as string,
            associatedSurveyId: associateSurveyId,
          },
        });
        if (!id) {
          this.survey = await this.prisma.survey.findUnique({
            where: { surveyId },
            include: { _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true } } },
          });
          await this.getAssociatedSurveys({});
        }
        this.result!.message = "Surveys are now associated";
      }
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async dissociateSurvey({
    associatedSurveyId,
    id = undefined,
    bi = false,
  }: {
    associatedSurveyId: string;
    id?: string;
    bi?: boolean;
  }) {
    const surveyId = id ?? this.survey?.surveyId;
    try {
      const { result: check } = await this.checkSurveyAssociation({
        associatedSurveyId,
        id: surveyId,
        bi,
      });
      if (check?.statusType === "OK") {
        const filter = bi
          ? {
              OR: [
                { associatedSurveyId, surveyId },
                { surveyId: associatedSurveyId, associatedSurveyId: surveyId },
              ],
            }
          : { AND: [{ surveyId, associatedSurveyId }] };
        await this.prisma.associatedSurvey.deleteMany({
          where: {
            ...filter,
          },
        });
        if (!id) {
          this.survey = await this.prisma.survey.findUnique({
            where: { surveyId },
            include: { _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true } } },
          });
          await this.getAssociatedSurveys({});
        }
        this.result!.message = "Surveys are no longer associated";
      }
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async getAssociatedSurveys({
    bi = false,
    id = null,
    reverse = false,
  }: {
    bi?: boolean;
    id?: string | null;
    reverse?: boolean;
  }) {
    const surveyId = id ?? this.survey!.surveyId;
    const filter = bi
      ? { OR: [{ surveyId }, { associatedSurveyId: surveyId }] }
      : reverse
        ? { associatedSurveyId: surveyId }
        : { surveyId };
    try {
      const associatedSurveys = await this.prisma.associatedSurvey.findMany({
        where: {
          ...filter,
        },
        include: {
          survey: true,
          associatedSurvey: true,
        },
        orderBy: {
          created: "desc",
        },
      });
      const duplicateFilter: { [key: string]: number } = {};
      let data: Survey[] = associatedSurveys.map((x) => (x.surveyId === surveyId ? x.associatedSurvey : x.survey));
      [...new Set(data.map((x) => x.surveyId))].forEach((y) => (duplicateFilter[y] = 1));
      data = data.filter((x) => {
        if (!duplicateFilter[x.surveyId]) return false;
        delete duplicateFilter[x.surveyId];
        return true;
      });
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

  async deleteSurvey({ id }: { id?: string }) {
    const surveyId = id ?? this.survey?.surveyId;
    try {
      const deletedSurvey = await this.prisma.survey.delete({
        where: { surveyId },
      });
      this.survey = null;
      this.result = statusMap.get(201)!({ data: deletedSurvey, message: `Survey deleted` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async getAllSurveys({
    filters,
    orderBy = { updated: "desc" },
  }: {
    filters?: Prisma.SurveyWhereInput;
    orderBy?: Prisma.SurveyOrderByWithRelationInput | Prisma.SurveyOrderByWithRelationInput[] | undefined;
  }) {
    try {
      const [surveys, count] = await this.prisma.$transaction([
        this.prisma.survey.findMany({
          where: { ...filters },
          orderBy,
          include: { _count: { select: { associatedSurveys: true, isAssociatedWithSurveys: true } } },
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
}