import { Router } from "express";
import {
  associateSurveyHandler,
  dissociateSurveyHandler,
  getAssociatedSurveysHandler,
} from "../controllers/survey.controllers";
import { checkAssociateSurveyExists, checkUserOwnsAssociateSurvey } from "../middleware/survey.middleware";

const router = Router({ mergeParams: true });

router.get("/", getAssociatedSurveysHandler);
router.patch("/:associateSurveyId", checkUserOwnsAssociateSurvey, associateSurveyHandler);
router.delete("/:associateSurveyId", checkUserOwnsAssociateSurvey, dissociateSurveyHandler);

router.param("associateSurveyId", checkAssociateSurveyExists);

export { router as associateSurveyRoutes };
