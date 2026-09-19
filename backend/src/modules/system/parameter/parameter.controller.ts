import { asyncHandler, success, validate } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import { keywordQuerySchema, parameterSchema } from "../system.schemas.js";
import * as parameterService from "./parameter.service.js";

export const listParameters = asyncHandler(async (req, res) => {
  const query = validate(keywordQuerySchema, req.query);
  const result = await parameterService.listParameters(query);
  return success(res, "List parameter", result.rows, result.pagination);
});

export const getParameter = asyncHandler(async (req, res) =>
  success(res, "Parameter detail", await parameterService.getParameter(param(req, "id"))),
);

export const createParameter = asyncHandler(async (req, res) =>
  success(
    res,
    "Parameter created successfully.",
    await parameterService.saveParameter(validate(parameterSchema, req.body)),
  ),
);

export const updateParameter = asyncHandler(async (req, res) =>
  success(
    res,
    "Parameter updated successfully.",
    await parameterService.saveParameter(validate(parameterSchema, req.body), param(req, "id")),
  ),
);

export const deleteParameter = asyncHandler(async (req, res) =>
  success(
    res,
    "Parameter deleted successfully.",
    await parameterService.deleteParameter(param(req, "id")),
  ),
);
