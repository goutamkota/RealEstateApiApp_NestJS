import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CREATE_HOME_PARAMS, HomeResponseDto, Image, QUERY_PARAMS, UPDATE_HOME_PARAMS } from "./dtos/home.dto";

const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  landSize: true,
  propertyType: true,
  numberOfBathrooms: true,
  numberOfBedrooms: true
};

@Injectable()
export class HomeService {
  constructor(private prismaService: PrismaService) {
  }

  async getHomes(filters: QUERY_PARAMS): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany(
      {
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true
            },
            take: 1
          }
        },
        where: filters
      }
    );
    if (!homes.length) throw new NotFoundException({ message: "No homes found" });
    return homes.map((home: any) => {
      const fetchedHome = { ...home, image: home.images[0].url };
      delete fetchedHome.images;
      return new HomeResponseDto(fetchedHome);
    });
  }

  async getHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique(
      {
        where: { id },
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true
            }
          },
          realtor: {
            select: {
              name: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      }
    );
    if (!home) throw new NotFoundException();
    return new HomeResponseDto(home);
  }

  async createHome({
                     address,
                     numberOfBedrooms,
                     numberOfBathrooms,
                     city,
                     price,
                     landSize,
                     propertyType,
                     images
                   }: CREATE_HOME_PARAMS, realtorId: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.create({
      data: { address, numberOfBedrooms, numberOfBathrooms, city, price, landSize, propertyType, realtorId }
    });
    const homeImages = images.map((image: Image) => {
      return { ...image, homeId: home.id };
    });
    await this.prismaService.image.createMany({ data: homeImages });
    return new HomeResponseDto(home);
  }

  async updateHome(id: number, data: UPDATE_HOME_PARAMS): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique(
      {
        where: {
          id
        }
      }
    );
    if (!home) throw new NotFoundException({ message: "Home not found" });

    const updatedHome = await this.prismaService.home.update({
      where: {
        id
      },
      data
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHome(id: number) {
    await this.prismaService.image.deleteMany({
      where: {
        homeId: id
      }
    });
    await this.prismaService.home.delete({
      where: {
        id
      }
    });
    return { message: "home deleted" };
  }

  async getRealtorById(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id
      },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });
    if (!home) throw new NotFoundException();
    return home.realtor;
  }
}