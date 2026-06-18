import { API_HEADER_KEY } from "@common/constants";
import { applyDecorators } from "@nestjs/common/decorators";
import { ApiHeader } from "@nestjs/swagger";

export function ApiHeaders() {
  return applyDecorators(
    ApiHeader({
      name: API_HEADER_KEY,
      description: "description"
    }),
  );
}
