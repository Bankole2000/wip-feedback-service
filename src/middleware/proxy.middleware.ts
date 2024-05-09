import { Request, Response, NextFunction } from "express";

export const getProxyRequestMetadata = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.meta) res.locals = req.body.meta;
  console.log({ locals: res.locals });
  return next();
};
