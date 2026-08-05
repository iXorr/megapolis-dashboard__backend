import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";

export interface WrappedResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  WrappedResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<WrappedResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === "object" && "meta" in data) {
          return data as unknown as WrappedResponse<T>;
        }
        return { data };
      }),
    );
  }
}
