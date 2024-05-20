import { Prisma } from "@prisma/client";
import { PostgresDBService } from "./common.service";
import {
  QuestionOptionReorderParams,
  QuestionReorderParams,
  RatingOptionReorderParams,
  ScaleOptionReorderParams,
  SectionReorderParams,
} from "./survey.custom.types";

export class QuestionUtilsService extends PostgresDBService {
  async countQuestions({ filters }: { filters?: Prisma.QuestionnaireWhereInput }) {
    return this.prisma.questionnaire.count({ where: { ...filters } });
  }

  buildQuestionReorderFilter({ newPosition, question }: QuestionReorderParams) {
    const { order: currentPosition, questionId, sectionId } = question;
    const increment: number = newPosition! < currentPosition ? +1 : -1;
    const subfilter: Prisma.QuestionWhereInput =
      newPosition! < currentPosition
        ? { order: { gte: newPosition, lt: currentPosition } }
        : { order: { lte: newPosition, gt: currentPosition } };
    const filter = { AND: [{ sectionId }, subfilter, { sectionId: { not: questionId } }] };
    return { filter, increment };
  }

  async countSections({ filters }: { filters?: Prisma.SectionWhereInput }) {
    return this.prisma.section.count({ where: { ...filters } });
  }

  buildSectionReorderFilter({ newPosition, section }: SectionReorderParams) {
    const { order: currentPosition, questionnaireId, sectionId } = section;
    const increment: number = newPosition! < currentPosition ? +1 : -1;
    const subfilter: Prisma.SectionWhereInput =
      newPosition! < currentPosition
        ? { order: { gte: newPosition, lt: currentPosition } }
        : { order: { lte: newPosition, gt: currentPosition } };
    const filter = { AND: [{ questionnaireId }, subfilter, { sectionId: { not: sectionId } }] };
    return { filter, increment };
  }

  async countQuestionOptions({ filters }: { filters?: Prisma.QuestionChoiceOptionWhereInput }) {
    return this.prisma.questionChoiceOption.count({ where: { ...filters } });
  }

  buildQuestionOptionReorderFilter({ newPosition, questionOption }: QuestionOptionReorderParams) {
    const { value: currentPosition, questionId } = questionOption;
    const increment: number = newPosition < currentPosition ? +1 : -1;
    const subfilter: Prisma.QuestionChoiceOptionWhereInput =
      newPosition! < currentPosition
        ? { value: { gte: newPosition, lt: currentPosition } }
        : { value: { lte: newPosition, gt: currentPosition } };
    const notSelf: Prisma.QuestionChoiceOptionWhereInput = {
      AND: [{ questionId: { not: questionId } }, { value: { not: currentPosition } }],
    };
    const filter = { AND: [{ questionId }, subfilter, notSelf] };
    return { filter, increment };
  }

  async countScaleOptions({ filters }: { filters?: Prisma.ScaleOptionWhereInput }) {
    return this.prisma.scaleOption.count({ where: { ...filters } });
  }

  buildScaleOptionReorderFilter({ newPosition, scaleOption }: ScaleOptionReorderParams) {
    const { value: currentPosition, responseTypeId } = scaleOption;
    const increment: number = newPosition < currentPosition ? +1 : -1;
    const subfilter: Prisma.ScaleOptionScalarWhereInput =
      newPosition! < currentPosition
        ? { value: { gte: newPosition, lt: currentPosition } }
        : { value: { lte: newPosition, gt: currentPosition } };
    const notSelf: Prisma.ScaleOptionScalarWhereInput = {
      AND: [{ responseTypeId: { not: responseTypeId } }, { value: { not: currentPosition } }],
    };
    const filter = { AND: [{ responseTypeId }, subfilter, notSelf] };
    return { filter, increment };
  }

  async countResponseTypes({ filters }: { filters?: Prisma.ResponseTypeWhereInput }) {
    return this.prisma.responseType.count({ where: { ...filters } });
  }

  async countRatingOptions({ filters }: { filters?: Prisma.RatingOptionWhereInput }) {
    return this.prisma.ratingOption.count({ where: { ...filters } });
  }

  buildRatingOptionReorderFilter({ newPosition, ratingOption }: RatingOptionReorderParams) {
    const { value: currentPosition, responseTypeId } = ratingOption;
    const increment: number = newPosition < currentPosition ? +1 : -1;
    const subfilter: Prisma.RatingOptionWhereInput =
      newPosition! < currentPosition
        ? { value: { gte: newPosition, lt: currentPosition } }
        : { value: { lte: newPosition, gt: currentPosition } };
    const notSelf: Prisma.RatingOptionScalarWhereInput = {
      AND: [{ responseTypeId: { not: responseTypeId } }, { value: { not: currentPosition } }],
    };
    const filter = { AND: [{ responseTypeId }, subfilter, notSelf] };
    return { filter, increment };
  }

  joinWithSymbol({ pre, post = "", symbol = "_" }: { pre: string; post: string | number; symbol: string }) {
    return `${pre}${symbol}${post}`;
  }
}
