import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { Post } from 'src/app/shared/interfaces/post.interface';
import { UserData } from 'src/app/shared/interfaces/user.interface';

enum ErrorCodeEnum {
  DATA_MISSING = 420,
  ALREADY_EXISTS = 409,
  INVALID_DATA = 422,
  UNKNOWN = 520
}
type ErrorCodeStrings = keyof typeof ErrorCodeEnum;

export interface IResponseEnvelope<T> {
  success: boolean;
  error?: ErrorCodeStrings;
  data?: T;
}

// 
export function wrapInEnvelope<T>() {
  return (response: Observable<T>): Observable<IResponseEnvelope<T>> => response.pipe(
    map(data => ({ success: true, data })),
    catchError((response: HttpErrorResponse) => of({ success: false, error: errorStatusHandler(response.status) })),
  );
}

// trying some enum types and fun out.
const errorStatusHandler = (code: ErrorCodeEnum): ErrorCodeStrings => {
  switch (code) {
    case ErrorCodeEnum.ALREADY_EXISTS:
      return 'ALREADY_EXISTS';
    case ErrorCodeEnum.DATA_MISSING:
      return 'DATA_MISSING';
    case ErrorCodeEnum.INVALID_DATA:
      return 'INVALID_DATA';
    case ErrorCodeEnum.UNKNOWN:
      return 'UNKNOWN';
    default:
      return 'UNKNOWN';
  }
};

interface PostServiceApi {
  loadPosts(): Observable<IResponseEnvelope<Post[]>>;
}
interface UserServiceApi {
  loadUsers(): Observable<IResponseEnvelope<UserData[]>>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Object grouping for quick identification of service related REST calls
  readonly postService: PostServiceApi = {
    loadPosts: () => {
      return this.api.get('https://jsonplaceholder.typicode.com/posts')
        .pipe(
          take(1),
          wrapInEnvelope<Post[]>()
        );
    },
  };
  readonly userService: UserServiceApi = {
    loadUsers: () => {
      return this.api.get('https://jsonplaceholder.typicode.com/users')
        .pipe(
          take(1),
          wrapInEnvelope<UserData[]>()
        );
    },
  };

  constructor(private api: HttpClient) { }
}
