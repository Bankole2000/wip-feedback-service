import { Router } from "express";
import {
  addSectionHandler,
  deleteSectionHandler,
  getQuestionnaireHandler,
  getSectionsHandler,
  updateQuestionnaireHandler,
  updateSectionHandler,
} from "../controllers/questionnaire.controllers";
import {
  createSectionSchema,
  updateQuestionnaireSchema,
  updateSectionSchema,
} from "../utils/schemas/questionnaire.schema";
import { validate } from "../middleware/zod.middleware";
import { checkSectionExists } from "../middleware/survey.middleware";

const router = Router({ mergeParams: true });

router.get("/", getQuestionnaireHandler);
router.patch("/", validate(updateQuestionnaireSchema, "Questionnaire update"), updateQuestionnaireHandler);
router.get("/sections", getSectionsHandler);
router.post("/sections", validate(createSectionSchema, "Section create"), addSectionHandler);
router.patch("/sections/:sectionId", validate(updateSectionSchema, "Section update"), updateSectionHandler);
router.delete("/sections/:sectionId", deleteSectionHandler);

router.param("sectionId", checkSectionExists);

export { router as questionnaireRoutes };
