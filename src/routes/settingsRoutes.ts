import { Router } from "express";
import {
  createResponseTypeHandler,
  deleteResponseTypeHandler,
  getDefaultSettingsHandler,
  getResponseTypeDetailsHandler,
  getResponseTypesHandler,
  getSurveyTypesHandler,
  updateResponseTypeHandler,
} from "../controllers/settings.controllers";
import { createResponseTypeSchema } from "../utils/schemas/questionnaire.schema";
import { validate } from "../middleware/zod.middleware";
import { responseOptionsRoutes } from "./responseOptionsRoutes";
import { checkResponseTypeExists } from "../middleware/survey.middleware";

const router = Router({ mergeParams: true });

router.get("/", getDefaultSettingsHandler); // Get all survey default settings
router.get("/response-types", getResponseTypesHandler); // Get custom response types
router.post("/response-types", validate(createResponseTypeSchema, "Response Type"), createResponseTypeHandler); // Create custom response types
router.patch("/response-types/:responseTypeId", updateResponseTypeHandler); // Update custom response type
router.delete("/response-types/:responseTypeId", deleteResponseTypeHandler); // Delete responseTypeId
router.use("/response-types/:responseTypeId/options", responseOptionsRoutes);
router.get("/response-types/:responseTypeId", getResponseTypeDetailsHandler); // Get response type details
router.get("/survey-types", getSurveyTypesHandler);

router.param("responseTypeId", checkResponseTypeExists);

export { router as settingsRoutes };
