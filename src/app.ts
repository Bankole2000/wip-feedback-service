import express, { Request, Response } from "express";
import { OK, ServiceResponse } from "@neoncoder/service-response";
import cors from "cors";

import { surveyRoutes } from "./routes/surveyRoutes";
import { notFoundHandler } from "./controllers/default.controllers";
import { getProxyRequestMetadata, requireUserRoles } from "./middleware/proxy.middleware";
import { adminRoutes } from "./routes/adminRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(getProxyRequestMetadata);

app.use("/v1/surveys", surveyRoutes);
app.use("/v1/surveys/admin", requireUserRoles({ roles: ["admin"] }), adminRoutes);

app.get("/health", async (_: Request, res: Response) => {
  const sr: ServiceResponse = OK({});
  return res.status(sr.statusCode).send(sr);
});

app.use("*", notFoundHandler);

export { app };
