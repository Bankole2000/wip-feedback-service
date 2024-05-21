import { isNotEmpty } from "@neoncoder/validator-utils";
import { number, object, string } from "zod";
import defaultResponseTypes from "../helpers/responseTypes.json";

const responseTypeOptions = defaultResponseTypes.map((x) => x.responseType);

const updateQuestionnaireFields = {
  name: string()
    .refine((data) => isNotEmpty(data), "name cannot be empty")
    .optional(),
};

export const updateQuestionnaireSchema = object({
  body: object({
    ...updateQuestionnaireFields,
  }),
});

const updateSectionFields = {
  ...updateQuestionnaireFields,
  description: string()
    .refine((data) => isNotEmpty(data), "Section description cannot be empty")
    .optional(),
  order: number().min(1).optional(),
};

export const createSectionSchema = object({
  body: object({
    ...updateQuestionnaireFields,
    description: string()
      .refine((data) => isNotEmpty(data), "Section description cannot be empty")
      .optional(),
  }),
});

export const updateSectionSchema = object({
  body: object({
    ...updateSectionFields,
  }),
  params: object({
    sectionId: string({}).refine((data) => isNotEmpty(data), "Section Id cannot be empty"),
  }),
});

export const createResponseTypeSchema = object({
  body: object({
    name: string().refine((data) => isNotEmpty(data), "name cannot be empty"),
    description: string().refine((data) => isNotEmpty(data), "Response description cannot be empty"),
    responseType: string({
      required_error: "Response Type is required",
    }).refine(
      (data) => responseTypeOptions.includes(data),
      `Response Type must be of one of ${responseTypeOptions.join(", ")}`,
    ),
  }),
});
