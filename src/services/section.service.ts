import { Prisma, PrismaClient, Section } from "@prisma/client";
import { PostgresDBService } from "./common.service";
import { SectionFiltersPaginated } from "./survey.custom.types";
import { statusMap } from "@neoncoder/service-response";
import { QuestionUtilsService } from "./questionUtils.service";

export class SectionService extends PostgresDBService {
  qid?: string;

  section: Section | null;

  sectionFields: string[];

  questionUtils: QuestionUtilsService;

  // questionFields: string[];

  // responseTypeFields: string[];

  constructor({ qid, section, prismaInstance }: { qid?: string; section?: Section; prismaInstance?: PrismaClient }) {
    super(prismaInstance);
    this.qid = qid;
    this.section = section ?? null;
    this.sectionFields = ["sectionId", "name", "order", "questionnaireId", "description"];
    this.questionUtils = new QuestionUtilsService();
  }

  async getSections({ page = 1, limit = 20, filters, orderBy, includes }: SectionFiltersPaginated) {
    try {
      const [sections, total] = await this.prisma.$transaction([
        this.prisma.section.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where: { ...filters },
          orderBy,
          include: this.getIncludes(includes),
        }),
        this.prisma.section.count({ where: { ...filters } }),
      ]);
      const { pages, next, prev } = this.paginate(total, limit, page);
      const data = { sections, total, pages, prev, next, meta: { filters, orderBy, includes, page, limit } };
      this.result = statusMap.get(200)!({ data, message: "OK" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async getSectionDetails({ sectionId, includes }: { sectionId: string; includes?: Prisma.SectionInclude }) {
    try {
      this.section = await this.prisma.section.findUnique({
        where: { sectionId },
        include: this.getIncludes(includes),
      });
      this.result = this.section
        ? statusMap.get(200)!({ data: this.section, message: "Section details" })
        : statusMap.get(404)!({ data: this.section, message: "Section not found" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async createSection({ sectionData }: { sectionData: Prisma.SectionUncheckedCreateWithoutQuestionnaireInput }) {
    const data = this.sanitize(this.sectionFields, sectionData);
    if (!data.questionnaireId) data.questionnaireId = this.qid!;
    data.order = (await this.questionUtils.countSections({ filters: { questionnaireId: data.questionnaireId } })) + 1;
    try {
      this.section = await this.prisma.section.create({ data, include: this.getIncludes() });
      this.result = statusMap.get(201)!({ data: this.section, message: "Section created" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async updateSection({
    updateData,
    sectionId = this.section?.sectionId,
  }: {
    updateData: Partial<Section> & { [key: string]: unknown };
    sectionId?: string;
  }) {
    const { order: newPosition } = updateData;
    const data = this.sanitize(this.sectionFields, updateData);
    try {
      if (newPosition) delete data.order;
      this.section = await this.prisma.section.update({
        where: { sectionId },
        data,
        include: this.getIncludes(),
      });
      newPosition !== this.section.order && newPosition !== undefined
        ? await this.reorderSection({ newPosition, section: this.section })
        : (this.result = statusMap.get(200)!({ data: this.section, message: "Section updated" }));
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async deleteSection({ sectionId = this.section?.sectionId }: { sectionId?: string }) {
    try {
      const deletedSection = await this.prisma.section.delete({
        where: { sectionId },
      });
      this.section = null;
      await this.prisma.section.updateMany({
        where: {
          AND: [{ questionnaireId: deletedSection.questionnaireId }, { order: { gte: deletedSection.order } }],
        },
        data: {
          order: {
            increment: -1,
          },
        },
      });
      this.result = statusMap.get(200)!({ data: deletedSection, message: "Section deleted" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async reorderSection({ newPosition, section = this.section! }: { newPosition: number; section?: Section }) {
    const { sectionId } = section;
    const include: Prisma.SectionInclude = this.getIncludes();
    const { filter, increment } = this.questionUtils.buildSectionReorderFilter({ newPosition, section });
    console.log({ filter, increment });
    try {
      const [temp, updateCount, updatedSection] = await this.prisma.$transaction([
        this.prisma.section.update({ where: { sectionId }, data: { order: 0 } }),
        this.prisma.section.updateMany({ where: filter, data: { order: { increment } } }),
        this.prisma.section.update({ where: { sectionId }, data: { order: newPosition }, include }),
      ]);
      console.log({ temp, updateCount, updatedSection });
      if (this.section) this.section = updatedSection;
      this.result = statusMap.get(200)!({ data: updatedSection, message: "Section updated" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  getIncludes(includes?: Prisma.SectionInclude) {
    const countInclude: Prisma.SectionInclude = { _count: { select: { questions: true } } };
    return { ...countInclude, ...includes };
  }
}
