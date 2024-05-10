import { Router } from "express";
import { defaultHandler } from "../controllers/default.controllers";

const router = Router({ mergeParams: true });

router.get("/", defaultHandler);
router.get("/search", defaultHandler);

export { router as adminRoutes };
