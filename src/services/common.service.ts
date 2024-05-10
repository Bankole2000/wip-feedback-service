import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { IDataAccess, TStatus, statusMap } from "@neoncoder/service-response";
import { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../lib/prisma";
import { sanitizeData } from "@neoncoder/validator-utils";

export class PostgresDBService implements IDataAccess {
  result: TStatus | undefined;

  prisma: PrismaClient;

  constructor(prismaInstance?: PrismaClient) {
    this.prisma = prismaInstance ?? getPrismaClient();
  }

  formatError(error: any, msg = "An error occurred") {
    const message = error.message ?? msg;
    console.log({ error });
    if (error instanceof PrismaClientValidationError || error instanceof PrismaClientKnownRequestError) {
      this.result = statusMap.get(400)!({ error, message });
      return;
    }
    this.result = statusMap.get(500)!({ error, message });
  }

  sanitize(fields: string[], data: any) {
    const sanitizedData = sanitizeData(fields, data);
    return sanitizedData;
  }
}
