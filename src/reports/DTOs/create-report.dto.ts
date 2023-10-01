import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReportDto {
  @IsString()
  creator: string;

  @IsString()
  model: string;

  @IsNumber()
  @Min(0)
  @Max(50000000)
  price: number;

  @IsNumber()
  @Min(1930)
  @Max(new Date().getFullYear())
  year: number;

  @IsNumber()
  @Min(0)
  @Max(3000000)
  mileage: number;

  @IsLongitude()
  lng: number;

  @IsLatitude()
  lat: number;
}
