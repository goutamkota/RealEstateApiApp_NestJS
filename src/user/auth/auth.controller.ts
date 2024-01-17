import { Body, Controller, Param, ParseEnumPipe, Post, UnauthorizedException } from "@nestjs/common";
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { AuthService } from "./auth.service";
import { UserType } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as process from "process";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup/:userType')
  async signup(@Body() body: SignupDto, @Param('userType', new ParseEnumPipe(UserType)) userType: UserType) {
    if (userType !== UserType.BUYER) {
        console.log(userType);
      if (!body.productKey) {
        throw new UnauthorizedException()
      }
    }
    const validProductKey: string = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    const isValidProductKey: boolean = await bcrypt.compare(validProductKey, body.productKey);
    if(!isValidProductKey) throw new UnauthorizedException();

    return this.authService.signup(body, userType);
  }
  @Post('/signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }
  @Post('/key')
  generateKey(@Body() { email, userType }: GenerateProductKeyDto) {
    return this.authService.generateKey(email, userType);
  }
}
