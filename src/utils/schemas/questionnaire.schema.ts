import { isNotEmpty } from "@neoncoder/validator-utils";
import { number, object, string } from "zod";

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
