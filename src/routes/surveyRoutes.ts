import { Router } from "express";
import { defaultHandler } from "../controllers/default.controllers";
import { validate } from "../middleware/zod.middleware";
import { createSurveySchema, searchSurveysSchema, updateSurveySchema } from "../utils/schemas/survey.schema";
import { requireUserType } from "../middleware/proxy.middleware";
import {
  checkAssociateSurveyExists,
  checkSurveyExists,
  checkUserOwnsAssociateSurvey,
  checkUserOwnsSurvey,
} from "../middleware/survey.middleware";
import {
  createSurveyHandler,
  getSurveysHandler,
  deleteSurveyHandler,
  updateSurveyHandler,
  getSurveyDetailsHandler,
  associateSurveyHandler,
  dissociateSurveyHandler,
  searchSurveysHandler,
} from "../controllers/survey.controllers";

const router = Router({ mergeParams: true });

router.get("/", defaultHandler);
router.get("/surveys", getSurveysHandler);
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
router.patch(
  "/surveys/:surveyId/associate/:associateSurveyId",
  checkUserOwnsSurvey,
  checkUserOwnsAssociateSurvey,
  associateSurveyHandler,
);
router.delete(
  "/surveys/:surveyId/associate/:associateSurveyId",
  checkUserOwnsSurvey,
  checkUserOwnsAssociateSurvey,
  dissociateSurveyHandler,
);
router.delete("/surveys/:surveyId", checkUserOwnsSurvey, deleteSurveyHandler);

router.param("surveyId", checkSurveyExists);
router.param("associateSurveyId", checkAssociateSurveyExists);

export { router as surveyRoutes };
