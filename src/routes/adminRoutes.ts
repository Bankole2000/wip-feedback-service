import { Router } from "express";
// import { defaultHandler } from "../controllers/default.controllers";
import { checkSurveyExists, checkAssociateSurveyExists } from "../middleware/survey.middleware";
import {
  associateSurveyHandler,
  createSurveyHandler,
  deleteSurveyHandler,
  dissociateSurveyHandler,
  getSurveyDetailsHandler,
  getSurveysHandler,
  searchSurveysHandler,
  updateSurveyHandler,
} from "../controllers/survey.controllers";
import { validate } from "../middleware/zod.middleware";
import { /* createSurveySchema, */ searchSurveysSchema, updateSurveySchema } from "../utils/schemas/survey.schema";

const router = Router({ mergeParams: true });

router.get("/", getSurveysHandler);
router.post("/", createSurveyHandler);
router.get("/search", validate(searchSurveysSchema, "Search Survey"), searchSurveysHandler);
router.get("/:surveyId", getSurveyDetailsHandler);
router.patch("/:surveyId", validate(updateSurveySchema, "Survey Update"), updateSurveyHandler);
router.delete("/:surveyId", deleteSurveyHandler);
router.patch("/:surveyId/associate/:associateSurveyId", associateSurveyHandler); // Associate Survey
router.delete("/:surveyId/associate/:associateSurveyId", dissociateSurveyHandler); // Dissociate Survey

export { router as adminRoutes };

router.param("surveyId", checkSurveyExists);
router.param("associateSurveyId", checkAssociateSurveyExists);
