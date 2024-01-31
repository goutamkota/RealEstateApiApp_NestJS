import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  Post,
  UnauthorizedException
} from "@nestjs/common";
import { GenerateProductKeyDto, SigninDto, SignupDto } from "../dtos/auth.dto";
import { AuthService } from "./auth.service";
import { UserType } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as process from "process";
import { DecodedJWT } from "../interceptors/user.interceptor";
import { User } from "../decorators/user.decorator";
import { Roles } from "../../decorators/roles.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Roles(UserType.BUYER, UserType.REALTOR)
  @Post("/signup/:userType")
  async signup(@Body() body: SignupDto, @Param("userType", new ParseEnumPipe(UserType)) userType: UserType) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        const validProductKey: string = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
        const isValidProductKey: boolean = await bcrypt.compare(validProductKey, body.productKey);
        if (!isValidProductKey) throw new UnauthorizedException();
      }
    }

    return this.authService.signup(body, userType);
  }

  @Post("/signin")
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Roles(UserType.ADMIN)
  @Post("/key")
  generateKey(@Body() { email, userType }: GenerateProductKeyDto) {
    return this.authService.generateKey(email, userType);
  }

  @Get("/me")
  WhoAmI(@User() user: DecodedJWT): DecodedJWT {
    if (!user) throw new NotFoundException();
    return user;
  }
}
