import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';

interface SignupParams {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup({ email, password, phoneNumber, name }: SignupParams) {
    const userExists: any = await this.prismaService.user.findUnique({
      where: { email },
    });
    console.log(userExists);
    if (userExists) {
      throw new ConflictException();
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prismaService.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        userType: UserType.BUYER,
      },
    });
    return { message: 'User is Registered' };
  }
}
