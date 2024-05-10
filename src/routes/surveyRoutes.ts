import { Router } from "express";
import { defaultHandler } from "../controllers/default.controllers";
import {
  checkSurveyExists,
  createSurveyHandler,
  getSurveysHandler,
  deleteSurveyHandler,
  updateSurveyHandler,
  getSurveyDetailsHandler,
  associateSurveyHandler,
  dissociateSurveyHandler,
  checkAssociateSurveyExists,
} from "../controllers/survey.controllers";
import { validate } from "../middleware/zod.middleware";
import { createSurveySchema, updateSurveySchema } from "../utils/schemas/survey.schema";
import { checkUserOwnsAssociateSurvey, checkUserOwnsSurvey } from "../middleware/survey.middleware";
import { requireUserType } from "../middleware/proxy.middleware";

const router = Router({ mergeParams: true });

router.get("/", defaultHandler);
router.get("/surveys", getSurveysHandler);
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
router.delete("/surveys/:surveyId", checkUserOwnsSurvey, deleteSurveyHandler);
router.get(
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

router.param("surveyId", checkSurveyExists);
router.param("associateSurveyId", checkAssociateSurveyExists);

export { router as surveyRoutes };
