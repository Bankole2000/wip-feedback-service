import { Router } from "express";
import { defaultHandler } from "../controllers/default.controllers";
import { createResponseTypeHandler, getDefaultSettingsHandler } from "../controllers/settings.controllers";
import { createResponseTypeSchema } from "../utils/schemas/questionnaire.schema";
import { validate } from "../middleware/zod.middleware";
import { responseOptionsRoutes } from "./responseOptionsRoutes";
import { checkResponseTypeExists } from "../middleware/survey.middleware";

const router = Router({ mergeParams: true });

router.get("/", getDefaultSettingsHandler); // Get all survey default settings
router.get("/response-types", defaultHandler); // Get custom response types
router.post("/response-types", validate(createResponseTypeSchema, "Response Type"), createResponseTypeHandler); // Create custom response types
router.patch("/response-types/:responseTypeId", defaultHandler); // Update custom response type
router.use("/response-types/:responseTypeId/options", responseOptionsRoutes);
router.delete("/response-types/:responseTypeId", defaultHandler); // Delete responseTypeId
router.get("/response-types/:responseTypeId", defaultHandler); // Get response type details
router.get("/survey-types", defaultHandler);

router.param("responseTypeId", checkResponseTypeExists);

export { router as settingsRoutes };
