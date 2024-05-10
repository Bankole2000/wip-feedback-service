import { Forbidden, NotFound, ServiceResponse, Unauthorized } from "@neoncoder/service-response";
import { Request, Response, NextFunction } from "express";

export const checkUserOwnsSurvey = async (_: Request, res: Response, next: NextFunction) => {
  const userId = res.locals?.user?.userID;
  let sr: ServiceResponse;
  if (!userId) {
    sr = Unauthorized({ message: "You need to be logged in" });
    return res.status(sr.statusCode).send(sr);
  }
  if (!res.locals.survey) {
    sr = NotFound({ message: "Survey not found" });
    return res.status(sr.statusCode).send(sr);
  }
  const { clientUserId, creatorUserId } = res.locals.survey;
  if (clientUserId !== userId && creatorUserId !== userId) {
    sr = Forbidden({ message: "You do not have the rights to perform this action" });
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
