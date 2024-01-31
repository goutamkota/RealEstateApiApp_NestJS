import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import * as jwt from "jsonwebtoken";

export interface DecodedJWT {
  name: string;
  id: number;
  iat: number;
  exp: number;
}

@Injectable()
export class UserInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const token = request?.headers?.authorization?.split("Bearer ")[1];
    request.user = jwt.decode(token)
    return next.handle();
  }
}
