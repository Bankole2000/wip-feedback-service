import defaultSurveyTypes from "./surveyTypes.json";
import defaultResponseTypes from "./responseTypes.json";
import { SurveyUtilsService } from "../../services/surveyUtils.service";
import { ResponseTypeService } from "../../services/responseType.service";
import { ResponseType } from "@prisma/client";

const sortFxn = (a: { name?: string | null }, b: { name?: string | null }) => b.name!.localeCompare(a.name as string);

const arrayEquals = (a: Record<string, unknown>[], b: Record<string, unknown>[]) => {
  a.sort(sortFxn);
  b.sort(sortFxn);
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => JSON.stringify(val) === JSON.stringify(b[index]))
  );
};

export const setDefaultSurveyTypes = async () => {
  const surveyUtils = new SurveyUtilsService({});
  const { surveyTypes, total } = (
    await surveyUtils.getTypes({ page: 1, limit: 20, filters: { createdByUserId: null } })
  ).result!.data;
  if (total === defaultSurveyTypes.length) {
    if (!arrayEquals(surveyTypes, defaultSurveyTypes)) {
      await Promise.all(
        defaultSurveyTypes.map(async (type) => {
          await surveyUtils.updateType({ surveyType: type.surveyType, data: type });
        }),
      );
      console.log("Survey Types updated");
    }
    console.log("Default Survey Types OK");
    return;
  }
  const { result } = await surveyUtils.batchCreateTypes({ batchData: defaultSurveyTypes });
  console.log(result!.message);
};

export const setDefaultResponseTypes = async () => {
  const responseService = new ResponseTypeService({});
  const { total, responseTypes }: { total: number; responseTypes: ResponseType[] } = (
    await responseService.getResponseTypes({ page: 1, limit: 20, filters: { createdByUserId: null } })
  ).result!.data;
  if (total && total === defaultResponseTypes.length) {
    const forComparison: Omit<ResponseType, "id" | "createdByUserId">[] = responseTypes.map(
      ({ name, description, responseType, responseTypeId }: ResponseType) => {
        return { name, description, responseType, responseTypeId };
      },
    );
    if (!arrayEquals(forComparison, defaultResponseTypes)) {
      const updateList: Record<string, unknown> = {};
      defaultResponseTypes.forEach((y) => (updateList[y.responseType] = y));
      await Promise.all(
        responseTypes.map(async (x: ResponseType) => {
          await responseService.updateResponseType({
            updateData: updateList[x.responseType!] as Partial<ResponseType>,
            responseType: x,
            isSystem: true,
          });
        }),
      );
      console.log("Response Types updated");
    }
    console.log("Default Response Types OK");
    return;
  }
  const { result } = await responseService.batchCreateResponseTypes({ batchData: defaultResponseTypes });
  console.log(result!.message);
};

export const setDefaults = async () => {
  await setDefaultResponseTypes();
  await setDefaultSurveyTypes();
};
