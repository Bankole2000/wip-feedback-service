import { Router } from "express";
import { defaultHandler } from "../controllers/default.controllers";
import {
  checkSurveyExists,
  createSurveyHandler,
  getSurveysHandler,
  deleteSurveyHandler,
  updateSurveyHandler,
  getSurveyDetailsHandler,
} from "../controllers/survey.controllers";
import { validate } from "../middleware/zod.middleware";
import { createSurveySchema, updateSurveySchema } from "../utils/schemas/survey.schema";
import { checkUserOwnsSurvey } from "../middleware/survey.middleware";
import { requireUserAuth, requireUserType } from "../middleware/proxy.middleware";

const router = Router({ mergeParams: true });

router.get("/", defaultHandler);
router.get("/surveys", requireUserAuth, getSurveysHandler);
router.get("/surveys/:surveyId", getSurveyDetailsHandler);
router.post(
  "/surveys",
  requireUserAuth,
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

router.param("surveyId", checkSurveyExists);

export { router as surveyRoutes };
