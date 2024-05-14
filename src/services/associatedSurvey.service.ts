import { AssociatedSurvey, Prisma, PrismaClient, Survey } from "@prisma/client";
import { PostgresDBService } from "./common.service";
import { statusMap } from "@neoncoder/service-response";
import { AssociatedSurveyFilters } from "./survey.custom.types";

export class AssociatedSurveyService extends PostgresDBService {
  surveyId?: string;

  fields: string[];

  constructor({ surveyId, prismaInstance }: { surveyId?: string; prismaInstance?: PrismaClient }) {
    super(prismaInstance);
    this.surveyId = surveyId;
    this.fields = ["surveyId", "associatedSurveyId"];
  }

  setSurveyId(surveyId: string) {
    this.surveyId = surveyId;
  }

  async checkSurveyAssociation({
    associatedSurveyId,
    surveyId = this.surveyId!,
    bi = false,
  }: {
    associatedSurveyId: string;
    surveyId: string;
    bi?: boolean;
  }) {
    const filter = this.biFilter({ bi, surveyId, associatedSurveyId });
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

  async getAllAssociatedSurveys({ bi = false, surveyId = this.surveyId!, reverse = false }: AssociatedSurveyFilters) {
    const filters: Prisma.AssociatedSurveyWhereInput = bi
      ? { OR: [{ surveyId }, { associatedSurveyId: surveyId }] }
      : reverse
        ? { associatedSurveyId: surveyId }
        : { surveyId };
    try {
      const results = await this.prisma.associatedSurvey.findMany({
        where: { ...filters },
        include: { associatedSurvey: true, survey: true },
      });
      const duplicateFilter: { [key: string]: number } = {};
      const surveys: Survey[] = [];
      results.forEach((x: Partial<AssociatedSurvey> & { survey: Survey; associatedSurvey: Survey }) => {
        x.surveyId === surveyId ? surveys.push(x.associatedSurvey) : surveys.push(x.survey);
      });
      [...new Set(surveys.map((x) => x.surveyId))].forEach((y) => (duplicateFilter[y] = 1));
      const data = surveys.filter((x) => {
        if (!duplicateFilter[x.surveyId]) return false;
        delete duplicateFilter[x.surveyId];
        return true;
      });
      this.result = statusMap.get(200)!({
        data: { surveys: data, count: data.length, meta: { filters } },
        message: "Associated Surveys",
      });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async deleteSurveyAssociation({
    associatedSurveyId,
    surveyId = this.surveyId!,
    bi = false,
  }: {
    associatedSurveyId: string;
    surveyId?: string;
    bi?: boolean;
  }) {
    try {
      const { result: check } = await this.checkSurveyAssociation({
        associatedSurveyId,
        surveyId,
        bi,
      });
      if (check?.statusType === "OK") {
        const filter: Prisma.AssociatedSurveyWhereInput = this.biFilter({ bi, associatedSurveyId, surveyId });
        await this.prisma.associatedSurvey.deleteMany({ where: { ...filter } });
        this.result!.message = "Surveys are no longer associated";
      }
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async createAssociation({
    associatedSurveyId,
    surveyId = this.surveyId!,
  }: {
    associatedSurveyId: string;
    surveyId?: string;
  }) {
    try {
      const { result: check } = await this.checkSurveyAssociation({
        associatedSurveyId,
        surveyId,
      });
      if (check?.code !== 200) {
        const data = await this.prisma.associatedSurvey.create({ data: { surveyId, associatedSurveyId } });
        this.result = statusMap.get(200)!({ data, message: "Surveys are now associated" });
      }
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async batchCreateAssociations({ surveyIds, surveyId = this.surveyId! }: { surveyIds: string[]; surveyId?: string }) {
    const data: { surveyId: string; associatedSurveyId: string }[] = [];
    surveyIds.forEach((id) => {
      id !== surveyId ? data.push({ surveyId, associatedSurveyId: id }) : null;
    });
    try {
      if (!data.length) this.result = statusMap.get(400)!({ message: "Invalid survey Ids to associate" });
      const results = await this.prisma.associatedSurvey.createMany({ data, skipDuplicates: true });
      this.result = statusMap.get(201)!({ message: `${results.count} surveys associated` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  biFilter({
    bi = false,
    surveyId,
    associatedSurveyId,
  }: {
    bi?: boolean;
    surveyId: string;
    associatedSurveyId: string;
  }) {
    return bi
      ? {
          OR: [
            { associatedSurveyId, surveyId },
            { surveyId: associatedSurveyId, associatedSurveyId: surveyId },
          ],
        }
      : { AND: [{ surveyId, associatedSurveyId }] };
  }
}
