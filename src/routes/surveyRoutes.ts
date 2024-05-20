import { Router } from "express";
import { defaultHandler } from "../controllers/default.controllers";
import { validate } from "../middleware/zod.middleware";
import { createSurveySchema, searchSurveysSchema, updateSurveySchema } from "../utils/schemas/survey.schema";
import { requireUserType } from "../middleware/proxy.middleware";
import { checkAssociateSurveyExists, checkSurveyExists, checkUserOwnsSurvey } from "../middleware/survey.middleware";
import {
  createSurveyHandler,
  getSurveysHandler,
  deleteSurveyHandler,
  updateSurveyHandler,
  getSurveyDetailsHandler,
  searchSurveysHandler,
} from "../controllers/survey.controllers";
import { questionnaireRoutes } from "./questionnaireRoutes";
import { associateSurveyRoutes } from "./associateSurveyRoutes";

const router = Router({ mergeParams: true });

router.get("/", defaultHandler);
router.get("/surveys", validate(searchSurveysSchema, "Survey Filters"), getSurveysHandler);
router.get("/search", validate(searchSurveysSchema, "Survey Search"), searchSurveysHandler);
router.get("/surveys/:surveyId", getSurveyDetailsHandler);
router.post(
  "/surveys",
  requireUserType({ types: ["coach", "client"] }),
  validate(createSurveySchema, "Survey create"),
  createSurveyHandler,
);
router.patch(
  "/surveys/:surveyId",
  validate(updateSurveySchema, "Survey update"),
  checkUserOwnsSurvey,
  updateSurveyHandler,
);
router.use("/surveys/:surveyId/associate", checkUserOwnsSurvey, associateSurveyRoutes);
router.use("/surveys/:surveyId/questionnaire", checkUserOwnsSurvey, questionnaireRoutes);

router.delete("/surveys/:surveyId", checkUserOwnsSurvey, deleteSurveyHandler);

router.param("surveyId", checkSurveyExists);
router.param("associateSurveyId", checkAssociateSurveyExists);

export { router as surveyRoutes };
