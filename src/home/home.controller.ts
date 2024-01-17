import { Controller, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { HomeService } from "./home.service";
import { PropertyType } from "@prisma/client";
import { HomeResponseDto } from "./dtos/home.dto";

@Controller("home")
export class HomeController {

  constructor(private homeService: HomeService) {
  }

  @Get()
  getHomes(
    @Query("city") city?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("propertyType") propertyType?: PropertyType
  ): Promise<HomeResponseDto[]> {
    console.log({city, minPrice, maxPrice, propertyType});
    return this.homeService.getHomes();
  }

  @Get(":id")
  getHomeById(): void {

  }

  @Post()
  createHome() {

  }

  @Put(":id")
  updateHome() {

  }

  @Delete(":id")
  deleteHome() {

  }

  @Post()
  enquiryHome() {

  }
}