import { Forbidden, ServiceResponse, Unauthorized } from "@neoncoder/service-response";
import { Request, Response, NextFunction } from "express";

export const getProxyRequestMetadata = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.user) res.locals.user = JSON.parse(req.headers.user as string);
  return next();
};

export const requireUserAuth = (_: Request, res: Response, next: NextFunction) => {
  if (!res.locals.user) {
    const sr = Unauthorized({});
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const requireUserRoles =
  ({ roles }: { roles: string[] }) =>
  (_: Request, res: Response, next: NextFunction) => {
    let sr: ServiceResponse;
    if (!res.locals.user) {
      sr = Unauthorized({});
      return res.status(sr.statusCode).send(sr);
    }
    const isAuthorized = roles.includes(res.locals.user!.role);
    if (!isAuthorized) {
      sr = Forbidden({});
      return res.status(sr.statusCode).send(sr);
    }
    return next();
  };

export const requireUserType =
  ({ types }: { types: string[] }) =>
  (_: Request, res: Response, next: NextFunction) => {
    let sr: ServiceResponse;
    if (!res.locals.user) {
      sr = Unauthorized({});
      return res.status(sr.statusCode).send(sr);
    }
    const isAuthorized = types.includes(res.locals.user!.userType);
    if (!isAuthorized) {
      sr = Forbidden({});
      return res.status(sr.statusCode).send(sr);
    }
    return next();
  };
