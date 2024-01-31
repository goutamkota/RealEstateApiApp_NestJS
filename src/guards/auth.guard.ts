import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import * as jwt from "jsonwebtoken";
import * as process from "process";
import { PrismaService } from "../prisma/prisma.service";
import { DecodedJWT } from "../user/interceptors/user.interceptor";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private prismaService: PrismaService) {
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<any> {
    const roles = this.reflector.getAllAndOverride(
      "roles",
      [context.getHandler(), context.getClass()]);
    if (roles?.length) {
      const request = context.switchToHttp().getRequest();
      const token = request?.headers?.authorization?.split("Bearer ")[1];
      try {
        const payload: DecodedJWT = jwt.verify(token, process.env.JSON_TOKEN) as DecodedJWT;
        const user: any = await this.prismaService.user.findUnique({
          where: {
            id: payload.id
          }
        });
        if (!user) return false;
        return roles.includes(user.userType);
      } catch (err) {
        return false;
      }
    }
    return true;
  }
}
