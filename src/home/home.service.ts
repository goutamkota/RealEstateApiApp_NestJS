import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { HomeResponseDto } from "./dtos/home.dto";

@Injectable()
export class HomeService {
  constructor(private prismaService: PrismaService) {
  }

  async getHomes(): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany(
      {
        select: {
          id: true,
          address: true,
          city: true,
          price: true,
          propertyType: true,
          numberOfBathrooms: true,
          numberOfBedrooms: true,
          images: {
            select: {
              url: true
            },
            take: 1
          }
        },
        where: {
          city: "chikiti",
          price: {
            gte: 3000,
            lte: 5000,
          },
          propertyType: "CONDO"
        }
      }
    );
    return homes.map((home: any) => {
      const fetchedHome = { ...home, image: home.images[0].url };
      delete fetchedHome.images;
      return new HomeResponseDto(fetchedHome);
    });
  }

  getHomeById(id: number) {
    // return this.prismaService.home.findUnique(
    //   where
    // )
  }
}