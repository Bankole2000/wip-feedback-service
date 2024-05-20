import { statusMap } from "@neoncoder/service-response";
import { PostgresDBService } from "./common.service";
import { SurveyTypeFiltersPaginated } from "./survey.custom.types";
import { Prisma, PrismaClient } from "@prisma/client";

export class SurveyUtilsService extends PostgresDBService {
  surveyTypeFields: string[];

  surveyId?: string;

  constructor({ surveyId, prismaInstance }: { surveyId?: string; prismaInstance?: PrismaClient }) {
    super(prismaInstance);
    this.surveyTypeFields = ["name", "description", "surveyType", "createdByUserId"];
    this.surveyId = surveyId;
  }

  async getTypes({ page = 1, limit = 20, filters = {}, orderBy = {} }: SurveyTypeFiltersPaginated) {
    try {
      const [surveyTypes, total] = await this.prisma.$transaction([
        this.prisma.surveyType.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where: { ...filters },
          orderBy,
          // include: { _count: { select: { surveys: true } } },
        }),
        this.prisma.surveyType.count({ where: { ...filters } }),
      ]);
      const { pages, next, prev } = this.paginate(total, limit, page);
      const data = { surveyTypes, total, pages, prev, next, meta: { filters, orderBy, page, limit } };
      this.result = statusMap.get(200)!({ data, message: "OK" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async checkTypeExists({ surveyType, createdByUserId = undefined }: { surveyType: string; createdByUserId?: string }) {
    const filter = createdByUserId ? { surveyTypeId: { createdByUserId, surveyType } } : { surveyType };
    try {
      const data = await this.prisma.surveyType.findUnique({ where: { ...filter } });
      this.result = data
        ? statusMap.get(200)!({ data, message: "Survey Type" })
        : statusMap.get(404)!({ data, message: "Survey Type not found" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async createType(surveyTypeData: Record<string, unknown>) {
    const data = this.sanitize(this.surveyTypeFields, surveyTypeData);
    try {
      const result = await this.prisma.surveyType.create({ data: data as Prisma.SurveyTypeCreateInput });
      this.result = statusMap.get(201)!({ data: result, message: "Survey Type created" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async updateType({
    surveyType,
    data,
    createdByUserId = undefined,
  }: {
    surveyType: string;
    data: Record<string, unknown>;
    createdByUserId?: string;
  }) {
    const update = this.sanitize(this.surveyTypeFields, data);
    const filter = createdByUserId ? { surveyTypeId: { createdByUserId, surveyType } } : { surveyType };
    try {
      const result = await this.prisma.surveyType.update({ where: filter, data: update });
      this.result = statusMap.get(201)!({ data: result, message: "Survey Type created" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async batchCreateTypes({
    batchData,
    createdByUserId = undefined,
  }: {
    batchData: Record<string, unknown>[];
    createdByUserId?: string;
  }) {
    const data = batchData.map((x) => this.sanitize(this.surveyTypeFields, { ...x, createdByUserId }));
    try {
      const result = await this.prisma.surveyType.createMany({
        data: [...(data as Prisma.SurveyTypeCreateManyInput[])],
        skipDuplicates: true,
      });
      this.result = statusMap.get(200)!({ data: result, message: `${result.count} Survey Types created` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async batchDeleteTypes({ filters }: { filters: Prisma.SurveyTypeWhereInput }) {
    try {
      const result = await this.prisma.surveyType.deleteMany({ where: { ...filters } });
      this.result = statusMap.get(200)!({ data: result, message: `${result.count} Survey Types deleted` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async deleteType({ surveyType, createdByUserId = undefined }: { surveyType: string; createdByUserId?: string }) {
    const filter = createdByUserId ? { surveyTypeId: { createdByUserId, surveyType } } : { surveyType };
    try {
      const result = await this.prisma.surveyType.delete({ where: { ...filter } });
      this.result = statusMap.get(200)!({ data: result, message: "Survey Type deleted" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async checkSurveyHasType({ surveyId = this.surveyId!, surveyType }: { surveyId: string; surveyType: string }) {
    const filter = { surveyHasTypeId: { surveyId, surveyType } };
    try {
      const data = await this.prisma.surveyHasType.findUnique({ where: filter });
      this.result = data
        ? statusMap.get(200)!({ data, message: `Survey has ${surveyType}` })
        : statusMap.get(404)!({ data, message: `Survey does not have ${surveyType} type` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async addSurveyType({ surveyId = this.surveyId!, surveyType }: { surveyId?: string; surveyType: string }) {
    const { result } = await this.checkSurveyHasType({ surveyId, surveyType });
    if (result!.statusType === "OK") return this;
    try {
      const result = await this.prisma.surveyHasType.create({ data: { surveyId, surveyType } });
      this.result = statusMap.get(201)!({ data: result, message: `${surveyType} type added to survey` });
    } catch (error) {
      this.formatError(error);
    }
    return this;
  }

  async batchAddSurveyType({ surveyId = this.surveyId!, surveyTypes }: { surveyId?: string; surveyTypes: string[] }) {
    const data = surveyTypes.map((x) => ({ surveyId, surveyType: x }));
    try {
      const result = await this.prisma.surveyHasType.createMany({ data, skipDuplicates: true });
      this.result = statusMap.get(201)!({ data: result, message: `${result.count} types added to survey` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async removeSurveyType({ surveyId = this.surveyId!, surveyType }: { surveyId: string; surveyType: string }) {
    const { result } = await this.checkSurveyHasType({ surveyId, surveyType });
    if (result!.statusType !== "OK") return this;
    try {
      const data = await this.prisma.surveyHasType.delete({ where: { surveyHasTypeId: { surveyId, surveyType } } });
      this.result = statusMap.get(200)!({ data, message: "Type is removed from survey" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async removeAllSurveyTypes({ surveyId = this.surveyId! }: { surveyId?: string }) {
    try {
      const data = await this.prisma.surveyHasType.deleteMany({ where: { surveyId } });
      this.result = statusMap.get(200)!({ data, message: `${data.count} types removed from survey` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }
}
