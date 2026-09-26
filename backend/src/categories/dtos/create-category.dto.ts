import { IsString, IsOptional, MaxLength, IsUUID } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
