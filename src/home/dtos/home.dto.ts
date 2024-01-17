import { PropertyType } from "@prisma/client";
import { Exclude } from "class-transformer";

export class HomeResponseDto {
  id: number;
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  listedDate: Date;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  image: string;

  @Exclude()
  createdDate: Date;
  @Exclude()
  updatedDate: Date;
  @Exclude()
  realtorId: number

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}