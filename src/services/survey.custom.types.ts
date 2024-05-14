import { Prisma, Survey } from "@prisma/client";

export type SurveyWithRelations =
  | (Partial<Survey> & { associatedSurveys?: Survey[]; isAssociatedWithSurveys?: Survey[] })
  | null;

export type SurveyFilters = {
  filters?: Prisma.SurveyWhereInput;
  orderBy?: Prisma.SurveyOrderByWithRelationInput | Prisma.SurveyOrderByWithRelationInput[];
};

export type SurveyFiltersPaginated = Partial<SurveyFilters> & { page: number; limit: number };

export type AssociatedSurveyFilters = {
  bi?: boolean;
  surveyId?: string;
  reverse?: boolean;
};
