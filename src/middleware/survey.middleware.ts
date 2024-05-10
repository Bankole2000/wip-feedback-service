import { Forbidden, ServiceResponse } from "@neoncoder/service-response";
import { Request, Response, NextFunction } from "express";

export const checkUserOwnsSurvey = async (_: Request, res: Response, next: NextFunction) => {
  const userId = res.locals?.user?.userID;
  let sr: ServiceResponse;
  const { clientUserId, creatorUserId } = res.locals.survey;
  if (clientUserId !== userId && creatorUserId !== userId) {
    sr = Forbidden({ message: "You do not have the rights to perform this action" });
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const checkUserOwnsAssociateSurvey = async (_: Request, res: Response, next: NextFunction) => {
  const userId = res.locals?.user?.userID;
  let sr: ServiceResponse;
  const { clientUserId, creatorUserId } = res.locals.associateSurvey;
  if (clientUserId !== userId && creatorUserId !== userId) {
    sr = Forbidden({ message: "You do not have the rights to perform this action" });
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
