import { Type, applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";

export function ApiPaginatedResponse<TModel extends Type>(
  model: TModel,
): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        properties: {
          data: {
            type: "array",
            items: { $ref: getSchemaPath(model) },
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "number", example: 1 },
              limit: { type: "number", example: 20 },
              total: { type: "number", example: 55 },
              totalPages: { type: "number", example: 3 },
            },
          },
        },
      },
    }),
  );
}
