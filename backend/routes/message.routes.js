import express from "express";
import { getMessages } from "../controllers/message.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/:userId").get(protect, getMessages);

export default router;