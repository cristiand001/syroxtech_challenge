import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MinLength,
} from "class-validator";

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @MinLength(1)
  brand: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsString()
  image?: string;

  @IsInt()
  categoryId: number;
}
