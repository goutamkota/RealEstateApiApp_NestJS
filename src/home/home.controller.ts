import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException
} from "@nestjs/common";
import { HomeService } from "./home.service";
import { PropertyType, UserType } from "@prisma/client";
import { CreateHomeDto, HomeResponseDto, QUERY_PARAMS, UpdateHomeDto } from "./dtos/home.dto";
import { User } from "../user/decorators/user.decorator";
import { DecodedJWT } from "../user/interceptors/user.interceptor";
import { Roles } from "../decorators/roles.decorator";

@Controller("home")
export class HomeController {

  constructor(private homeService: HomeService) {
  }

  @Get()
  getHomes(
    @Query("city") city?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("minLandSize") minLandSize?: string,
    @Query("maxLandSize") maxLandSize?: string,
    @Query("propertyType") propertyType?: PropertyType
  ): Promise<HomeResponseDto[]> {

    const createFilter = (min: string, max: string) => (min || max) && {
      gte: min && parseFloat(min),
      lte: max && parseFloat(max)
    };

    const filters: QUERY_PARAMS = {
      city,
      price: createFilter(minPrice, maxPrice),
      landSize: createFilter(minLandSize, maxLandSize),
      propertyType
    };

    return this.homeService.getHomes(filters);
  }

  @Get(":id")
  getHomeById(@Param("id", ParseIntPipe) id: number): Promise<HomeResponseDto> {
    return this.homeService.getHomeById(id);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: DecodedJWT): Promise<HomeResponseDto> {
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.REALTOR)
  @Put(":id")
  async updateHome(@Param("id") id: number, @Body() body: UpdateHomeDto, @User() user: DecodedJWT): Promise<HomeResponseDto> {
    const realtor = await this.homeService.getRealtorById(id);
    if (realtor.id !== user.id) throw new UnauthorizedException();
    return this.homeService.updateHome(id, body);
  }

  @Roles(UserType.REALTOR)
  @Delete(":id")
  async deleteHome(@Param("id", ParseIntPipe) id: number, @User() user: DecodedJWT) {
    const realtor = await this.homeService.getRealtorById(id);
    if (realtor.id !== user.id) throw new UnauthorizedException();
    return this.homeService.deleteHome(id);
  }

  @Post()
  enquiryHome() {

  }
}


// ? difficult approach
// const price = minPrice || maxPrice ? {
//   ...(minPrice && { gte : parseFloat(minPrice)}),
//   ...(maxPrice && { gte : parseFloat(maxPrice)}),
// } : undefined;
// const land = minLandSize || maxLandSize ? {
//   ...(minLandSize && { gte : parseFloat(minLandSize)}),
//   ...(maxLandSize && { gte : parseFloat(maxLandSize)}),
// } : undefined;
// const filters : QUERY_PARAMS = {
//   ...(city && {city}),
//   ...(price && {price}),
//   ...(land && {land}),
//   ...(propertyType && {propertyType}),
// }