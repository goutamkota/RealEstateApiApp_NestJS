import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { UserType } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import * as process from "process";

interface SignupParams {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {
  }

  private envToken = process.env.JSON_TOKEN;

  async signup({ email, password, phoneNumber, name }: SignupParams, userType: UserType) {
    const userExists: any = await this.prismaService.user.findUnique({
      where: { email }
    });
    if (userExists) {
      throw new ConflictException({ message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        userType: userType
      }
    });
    const token = await this.generateJWT(user.name, user.id);
    return { message: "User is Registered", token: token };
  }

  async signin({ email, password }: SigninParams) {
    const user: any = await this.prismaService.user.findUnique({
      where: { email }
    });
    if (!user) {
      throw new ConflictException("Didn't find a user with the provided Email");
    }
    if (user) {
      const isPasswordMatched = await bcrypt.compare(password, user.password);
      if (isPasswordMatched) {
        const token = await this.generateJWT(user.name, user.id);
        return { message: "User is Logged In", token: token };
      } else {
        // return {
        //   status: 0,
        //   message: "Password didn't Match! Please try again",
        // };
        throw new UnauthorizedException(
          "Password didn't Match! Please try again"
        );
      }
    }
    // return {
    //   status: 0,
    //   message: "Didn't find a user with the provided Email",
    // };
  }

  private async generateJWT(name: string, id: number) {
    return jwt.sign(
      {
        name: name,
        id: id
      },
      this.envToken,
      {
        expiresIn: 7200
      }
    );
  }

  generateKey(email: string, userType: UserType) {
    const key: string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return bcrypt.hash(key, 10);
  }
}
