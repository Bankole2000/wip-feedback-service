import { Router } from "express";
import {
  addScaleOptionHandler,
  deleteScaleOptionHandler,
  getScaleOptionTemplatesHandler,
  getScaleOptionsHandler,
  updateScaleOptionHandler,
  useScaleOptionTemplatesHandler,
} from "../controllers/responseOptions.controllers";

const router = Router({ mergeParams: true });

router.get("/", getScaleOptionsHandler); // get response type options
router.get("/templates", getScaleOptionTemplatesHandler);
router.post("/templates", useScaleOptionTemplatesHandler);
router.post("/", addScaleOptionHandler); // add option to response type
router.patch("/:value", updateScaleOptionHandler);
router.delete("/:value", deleteScaleOptionHandler);

export { router as responseOptionsRoutes };
