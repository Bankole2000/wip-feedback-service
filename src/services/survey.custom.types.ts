import { Prisma, Question, QuestionChoiceOption, RatingOption, ScaleOption, Section, Survey } from "@prisma/client";

export type SurveyWithRelations =
  | (Partial<Survey> & { associatedSurveys?: Survey[]; isAssociatedWithSurveys?: Survey[] })
  | null;

export type SurveyFilters = {
  filters?: Prisma.SurveyWhereInput;
  orderBy?: Prisma.SurveyOrderByWithRelationInput | Prisma.SurveyOrderByWithRelationInput[];
  includes?: Prisma.SurveyInclude;
};

export type SurveyFiltersPaginated = Partial<SurveyFilters> & { page: number; limit: number };

export type AssociatedSurveyFilters = {
  bi?: boolean;
  surveyId?: string;
  reverse?: boolean;
};

export type SurveyTypeFilters = {
  filters?: Prisma.SurveyTypeWhereInput;
  orderBy?: Prisma.SurveyTypeOrderByWithRelationInput | Prisma.SurveyTypeOrderByWithRelationInput[];
  includes?: Prisma.SurveyTypeInclude;
};

export type SurveyTypeFiltersPaginated = Partial<SurveyTypeFilters> & { page?: number; limit?: number };

export type SectionFilters = {
  filters?: Prisma.SectionWhereInput;
  orderBy?: Prisma.SectionOrderByWithRelationInput | Prisma.SectionOrderByWithRelationInput[];
  includes?: Prisma.SectionInclude;
};

export type SectionFiltersPaginated = Partial<SectionFilters> & { page?: number; limit?: number };

export type QuestionnaireFilters = {
  filters?: Prisma.QuestionnaireWhereInput;
  orderBy?: Prisma.QuestionnaireOrderByWithRelationInput | Prisma.QuestionnaireOrderByWithRelationInput[];
  includes?: Prisma.QuestionnaireInclude;
};

export type QuestionnaireFiltersPaginated = Partial<QuestionnaireFilters> & { page?: number; limit?: number };

export type ResponseTypeFilters = {
  filters?: Prisma.ResponseTypeWhereInput;
  orderBy?: Prisma.ResponseTypeOrderByWithRelationInput | Prisma.ResponseTypeOrderByWithRelationInput[];
  includes?: Prisma.ResponseTypeInclude;
};

export type ResponseTypeFiltersPaginated = Partial<ResponseTypeFilters> & { page?: number; limit?: number };

export type ReorderParams = {
  newPosition: number;
};

export type SectionReorderParams = ReorderParams & { section: Section };
export type QuestionReorderParams = ReorderParams & { question: Question };
export type QuestionOptionReorderParams = ReorderParams & { questionOption: QuestionChoiceOption };
export type ScaleOptionReorderParams = ReorderParams & { scaleOption: ScaleOption };
export type RatingOptionReorderParams = ReorderParams & { ratingOption: RatingOption };
