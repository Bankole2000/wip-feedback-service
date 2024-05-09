import { Router } from "express";
import { defaultHandler } from "../controllers/default.controllers";
import { getSurveysHandler } from "../controllers/survey.controllers";

const router = Router({ mergeParams: true });

router.get("/surveys", getSurveysHandler);
router.post("/surveys", defaultHandler);
router.patch("/surveys/:surveyId", defaultHandler);
router.delete("/surveys/:surveyId", defaultHandler);

export { router as surveyRoutes };
