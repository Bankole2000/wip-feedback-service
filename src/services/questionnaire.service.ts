import { Prisma, PrismaClient, Questionnaire } from "@prisma/client";
import { PostgresDBService } from "./common.service";
import { statusMap } from "@neoncoder/service-response";
import { QuestionnaireFiltersPaginated } from "./survey.custom.types";
import { SectionService } from "./section.service";

export class QuestionnaireService extends PostgresDBService {
  qid?: string;

  questionnaire?: Questionnaire | null;

  sectionService: SectionService;

  fields: string[];

  constructor({ surveyId, prismaInstance }: { surveyId?: string; prismaInstance?: PrismaClient }) {
    super(prismaInstance);
    this.qid = surveyId;
    this.fields = ["questionnaireId", "name"];
    this.sectionService = new SectionService({ qid: surveyId });
  }

  async getQuestionnaireById({ id = this.qid, include }: { id?: string; include?: Prisma.QuestionnaireInclude }) {
    try {
      const questionnaire = await this.prisma.questionnaire.findUnique({
        where: { questionnaireId: id },
        include: include ?? { _count: { select: { section: true, questions: true } } },
      });
      this.questionnaire =
        questionnaire ??
        (await this.prisma.questionnaire.create({
          data: { questionnaireId: id },
          include: { _count: { select: { section: true, questions: true } } },
        }));
      this.result = statusMap.get(200)!({ data: this.questionnaire, message: "Questionnaire" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async getQuestionnaires({ page = 1, limit = 20, filters, orderBy }: QuestionnaireFiltersPaginated) {
    try {
      const [questionnaires, total] = await this.prisma.$transaction([
        this.prisma.questionnaire.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where: { ...filters },
          orderBy,
          include: { _count: { select: { section: true, questions: true } } },
        }),
        this.prisma.questionnaire.count({ where: { ...filters } }),
      ]);
      const { pages, prev, next } = this.paginate(total, limit, page);
      const data = { questionnaires, total, pages, prev, next, meta: { filters, orderBy, page, limit } };
      this.result = statusMap.get(200)!({ data, message: "OK" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async updateQuestionnaire({ updateData, id = this.qid }: { updateData: Record<string, unknown>; id?: string }) {
    const data = this.sanitize(this.fields, updateData);
    try {
      const result = await this.prisma.questionnaire.update({
        where: { questionnaireId: id },
        data,
        include: { _count: { select: { section: true, questions: true } } },
      });
      this.result = statusMap.get(201)!({ data: result, message: "Questionnaire updated" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async deleteQuestionnaire({ questionnaireId = this.qid }: { questionnaireId?: string }) {
    try {
      const deletedQ = await this.prisma.questionnaire.delete({ where: { questionnaireId } });
      this.questionnaire = null;
      this.result = statusMap.get(200)!({ data: deletedQ, message: "Questionnaire deleted" });
    } catch (error) {
      this.formatError(error);
    }
    return this;
  }
}
