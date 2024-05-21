import { Router } from "express";
import { defaultHandler } from "../controllers/default.controllers";

const router = Router({ mergeParams: true });

router.get("/", defaultHandler); // get response type options
router.post("/", defaultHandler); // add option to response type
router.patch("/", defaultHandler);

export { router as responseOptionsRoutes };
