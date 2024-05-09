import express, { Request, Response } from "express";
import { OK, ServiceResponse } from "@neoncoder/service-response";
import cors from "cors";

import { surveyRoutes } from "./routes/surveyRoutes";
import { notFoundHandler } from "./controllers/default.controllers";
import { getProxyRequestMetadata } from "./middleware/proxy.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/v1/surveys", async (_: Request, res: Response) => {
  res.status(200).send({ message: "Hi from the survey service" });
});

app.use("/v1/surveys", getProxyRequestMetadata, surveyRoutes);

app.get("/health", async (_: Request, res: Response) => {
  const sr: ServiceResponse = OK({});
  return res.status(sr.statusCode).send(sr);
});

app.use("*", notFoundHandler);

export { app };
