import { Prisma, PrismaClient, ResponseType } from "@prisma/client";
import { PostgresDBService } from "./common.service";
import { ResponseTypeFiltersPaginated } from "./survey.custom.types";
import { statusMap } from "@neoncoder/service-response";
import { QuestionUtilsService } from "./questionUtils.service";

export class ResponseTypeService extends PostgresDBService {
  responseType: ResponseType | null;

  questionUtils: QuestionUtilsService;

  responseTypeFields: string[];

  scaleOptionFields: string[];

  constructor({ responseType, prismaInstance }: { responseType?: ResponseType; prismaInstance?: PrismaClient }) {
    super(prismaInstance);
    this.responseType = responseType ?? null;
    this.responseTypeFields = ["name", "description", "createdByUserId", "responseType", "responseTypeId"];
    this.scaleOptionFields = ["name", "value", "responseTypeId"];
    this.questionUtils = new QuestionUtilsService();
  }

  async getResponseTypes({ page = 1, limit = 20, filters, orderBy }: ResponseTypeFiltersPaginated) {
    try {
      const [responseTypes, total] = await this.prisma.$transaction([
        this.prisma.responseType.findMany({ take: limit, skip: (page - 1) * limit, where: { ...filters }, orderBy }),
        this.prisma.responseType.count({ where: { ...filters } }),
      ]);
      const { pages, next, prev } = this.paginate(total, limit, page);
      const data = { responseTypes, total, pages, prev, next, meta: { filters, orderBy, page, limit } };
      this.result = statusMap.get(200)!({ data, message: "OK" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async createResponseType({
    responseTypeData,
    isSystem = false,
  }: {
    responseTypeData: Partial<ResponseType>;
    isSystem?: boolean;
  }) {
    const data: Prisma.ResponseTypeCreateInput = this.sanitize(this.responseTypeFields, responseTypeData);
    try {
      this.prisma.$transaction(async (tx) => {
        const newResponseType = await tx.responseType.create({ data });
        if (!isSystem) {
          const { id, responseType } = newResponseType;
          const responseTypeId = this.questionUtils.joinWithSymbol({ pre: responseType!, symbol: "_", post: id });
          this.responseType = await tx.responseType.update({ where: { id }, data: { responseTypeId } });
        } else {
          this.responseType = newResponseType;
        }
      });
      this.result = statusMap.get(201)!({ data: this.responseType, message: "Response type created" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async updateResponseType({
    updateData,
    responseType = this.responseType!,
    isSystem = false,
  }: {
    updateData: Partial<ResponseType>;
    responseType: ResponseType;
    isSystem?: boolean;
  }) {
    const { id, responseType: oldResponseType } = responseType;
    const { responseType: newResponseType } = updateData;
    const data: Prisma.ResponseTypeUpdateInput = this.sanitize(this.responseTypeFields, updateData);
    try {
      if (!isSystem) {
        if (!(!newResponseType || newResponseType === oldResponseType)) {
          const newResponseTypeId = this.questionUtils.joinWithSymbol({ pre: newResponseType, post: id, symbol: "_" });
          data.responseTypeId = newResponseTypeId;
        }
      }
      this.responseType = await this.prisma.responseType.update({ where: { id }, data });
      this.result = statusMap.get(200)!({ data: this.responseType, message: "Response Type updated" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async deleteResponseType({ id = this.responseType?.id }: { id?: number }) {
    try {
      const deletedResponseType = await this.prisma.responseType.delete({ where: { id } });
      this.responseType = null;
      this.result = statusMap.get(200)!({ data: deletedResponseType, message: "Deleted Response Type" });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }

  async batchCreateResponseTypes({ batchData }: { batchData: Prisma.ResponseTypeCreateManyInput[] }) {
    try {
      const result = await this.prisma.responseType.createMany({
        data: [...batchData],
        skipDuplicates: true,
      });
      this.result = statusMap.get(200)!({ data: result, message: `${result.count} Response Types created` });
    } catch (error: any) {
      this.formatError(error);
    }
    return this;
  }
}
