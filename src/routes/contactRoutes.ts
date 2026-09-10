import { Router } from "express";
import { body } from "express-validator";
import { submitContactMessage } from "../controllers/contactController";
import { contactFormLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post(
  "/",
  contactFormLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 100 }),
    body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("subject").trim().notEmpty().withMessage("Subject is required.").isLength({ max: 150 }),
    body("message")
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage("Message must be between 10 and 5000 characters."),
    // Honeypot field: bots fill every input, humans never see this one.
    body("company").custom((value) => {
      if (value) throw new Error("Spam detected.");
      return true;
    }),
  ],
  submitContactMessage
);

export default router;
