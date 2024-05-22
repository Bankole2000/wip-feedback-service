import { Router } from "express";
import {
  addQuestionnaireResponseTypeHandler,
  addSectionHandler,
  deleteSectionHandler,
  getQuestionnaireHandler,
  getQuestionnaireResponseTypesHandler,
  getSectionsHandler,
  removeQuestionnaireResponseTypeHandler,
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
router.get("/response-types", getQuestionnaireResponseTypesHandler);
router.post("/response-types", addQuestionnaireResponseTypeHandler);
router.delete("/response-types/:responseTypeId", removeQuestionnaireResponseTypeHandler);

router.param("sectionId", checkSectionExists);

export { router as questionnaireRoutes };
