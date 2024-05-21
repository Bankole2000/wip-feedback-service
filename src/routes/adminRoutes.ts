import { Router } from "express";
// import { defaultHandler } from "../controllers/default.controllers";
import { checkSurveyExists, checkAssociateSurveyExists } from "../middleware/survey.middleware";
import {
  associateSurveyHandler,
  createSurveyHandler,
  deleteSurveyHandler,
  dissociateSurveyHandler,
  getAssociatedSurveysHandler,
  getSurveyDetailsHandler,
  getSurveysHandler,
  searchSurveysHandler,
  updateSurveyHandler,
} from "../controllers/survey.controllers";
import { validate } from "../middleware/zod.middleware";
import { createSurveySchema, searchSurveysSchema, updateSurveySchema } from "../utils/schemas/survey.schema";

const router = Router({ mergeParams: true });

router.get("/", validate(searchSurveysSchema, "Survey Filters"), getSurveysHandler);
router.post("/", validate(createSurveySchema, "Survey create"), createSurveyHandler);
router.get("/search", validate(searchSurveysSchema, "Search Survey"), searchSurveysHandler);
router.get("/:surveyId", getSurveyDetailsHandler);
router.patch("/:surveyId", validate(updateSurveySchema, "Survey Update"), updateSurveyHandler);
router.delete("/:surveyId", deleteSurveyHandler);
router.get("/:surveyId/associate", getAssociatedSurveysHandler);
router.patch("/:surveyId/associate/:associateSurveyId", associateSurveyHandler); // Associate Survey
router.delete("/:surveyId/associate/:associateSurveyId", dissociateSurveyHandler); // Dissociate Survey

router.param("surveyId", checkSurveyExists);
router.param("associateSurveyId", checkAssociateSurveyExists);

export { router as adminRoutes };
