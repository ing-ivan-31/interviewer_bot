import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 20, description: 'Items per page' })
  perPage: number;

  @ApiProperty({ example: 45, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 3, description: 'Total number of pages' })
  totalPages: number;
}

export class ResponseMeta {
  @ApiPropertyOptional({ type: PaginationMeta })
  pagination?: PaginationMeta;
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Response payload' })
  data: T;

  @ApiPropertyOptional({ type: ResponseMeta })
  meta?: ResponseMeta;
}

export class ApiErrorDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Error message or array of messages',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request', description: 'HTTP error name' })
  error: string;
}
