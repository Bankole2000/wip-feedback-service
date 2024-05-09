import { IDataAccess, TStatus, statusMap } from "@neoncoder/service-response";
import { PrismaClient, Survey, Prisma } from "@prisma/client";
import { getPrismaClient } from "../lib/prisma";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";

export class SurveyService implements IDataAccess {
  result: TStatus | undefined;

  prisma: PrismaClient;

  survey: Survey | null;

  constructor(prismaInstance?: PrismaClient) {
    this.prisma = prismaInstance ?? getPrismaClient();
    this.survey = null;
  }

  async getSurveys({ page = 1, limit = 20, filters = {}, orderBy = {} }) {
    try {
      const [surveys, total] = await this.prisma.$transaction([
        this.prisma.survey.findMany({ take: limit, skip: (page - 1) * limit, where: { ...filters }, orderBy }),
        this.prisma.survey.count({ where: { ...filters } }),
      ]);
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      const data = { surveys, total, pages, prev, next, meta: { filters, orderBy } };
      this.result = statusMap.get(200)!({ data });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async createSurvey(newSurveyData: Prisma.SurveyCreateInput) {
    try {
      this.survey = await this.prisma.survey.create({
        data: { ...newSurveyData },
      });
      this.result = statusMap.get(201)!({ data: this.survey });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async getSurveyById({ id }: { id: string }) {
    try {
      this.survey = await this.prisma.survey.findUnique({
        where: {
          surveyId: id,
        },
      });
      this.result = statusMap.get(200)!({ data: this.survey });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  formatError(error: any, msg = "An error occurred") {
    const message = error.message ?? msg;
    if (error instanceof PrismaClientValidationError || error instanceof PrismaClientKnownRequestError) {
      this.result = statusMap.get(400)!({ error, message });
      return;
    }
    this.result = statusMap.get(500)!({ error, message });
  }
}
