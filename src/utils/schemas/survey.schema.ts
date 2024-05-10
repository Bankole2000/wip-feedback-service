import { isNotEmpty, isValidDate, isValidObjectId } from "@neoncoder/validator-utils";
import { boolean, number, object, string } from "zod";

export const updateSurveyFields = {
  shortDesc: string({
    required_error: "Survey short description is required",
  })
    .refine((data) => isNotEmpty(data), "Short Description cannot be empty")
    .optional(),
  clientUserId: string({
    required_error: "Creator User Id is required",
  })
    .refine((data) => isNotEmpty(data), "Client User Id cannot be empty")
    .refine((data) => isValidObjectId(data), "Invalid client user Id")
    .optional(),
  hasRequestFeedbackEnabled: boolean({
    invalid_type_error: "Request Feedback Enabled should be a boolean",
  }).optional(),
  hasProvideFeedbackEnabled: boolean({
    invalid_type_error: "Request Feedback Enabled should be a boolean",
  }).optional(),
  canViewParticipants: boolean({
    invalid_type_error: "Request Feedback Enabled should be a boolean",
  }).optional(),
  feedbackGiverSurveyThreshold: number({
    required_error: "Feedback Giver Survey Threshold is required",
  })
    .min(1, "Minimum Feedback Giver Survey Threshold is 1")
    .int("Must be a whole number (Integer)")
    .optional(),
  responsePerQuestionnaireThreshold: number({
    required_error: "Feedback Giver Survey Threshold is required",
  })
    .min(1, "Minimum Reponse per questionnaire Threshold is 1")
    .int("Must be a whole number (Integer)")
    .optional(),
  requiresSelfAssessment: boolean({
    invalid_type_error: "Requires self assessment should be a boolean",
  }).optional(),
  reportType: string()
    .refine(
      (data) => ["INDIVIDUAL", "ORGANIZATION"].includes(data),
      "report type must be either 'INDIVIDUAL' or 'ORGANIZATION'",
    )
    .optional(),
  associatedSurveys: string().array().optional(),
  published: boolean({
    invalid_type_error: "Published should be a boolean",
  }).optional(),
  openingDate: string()
    .refine((data) => isValidDate(data), "Invalid opening date entered")
    .optional(),
  closingDate: string()
    .refine((data) => isValidDate(data), "Invalid closing date entered")
    .optional(),
};

export const createSurveySchema = object({
  body: object({
    name: string({
      required_error: "Survey name is required",
    }).refine((data) => isNotEmpty(data), "Survey name cannot be empty"),
    ...updateSurveyFields,
  }).refine((data) => {
    if (data.openingDate && data.closingDate) {
      return new Date(data.openingDate) >= new Date(data.closingDate) ? false : true;
    }
    return true;
  }, "Survey opening time must be before closing time"),
});

export const updateSurveySchema = object({
  body: object({
    name: string({
      required_error: "Survey name is required",
    })
      .refine((data) => isNotEmpty(data), "Survey name cannot be empty")
      .optional(),
    ...updateSurveyFields,
  }).refine((data) => {
    if (data.openingDate && data.closingDate) {
      return new Date(data.openingDate) >= new Date(data.closingDate) ? false : true;
    }
    return true;
  }, "Survey opening time must be before closing time"),
});
