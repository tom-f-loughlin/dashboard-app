import { Injectable } from '@angular/core';
import { MOCK_USERS } from 'src/app/pages/home/model/login.mock';
import { MOCK_POSTS } from 'src/app/pages/posts/model/posts.mocks';
import { Post } from 'src/app/shared/interfaces/post.interface';
import { PaginationService } from 'src/app/services/pagination.service';
import { map, withLatestFrom, distinctUntilChanged, take, share, shareReplay } from 'rxjs/operators';
import { Observable, of, combineLatest } from 'rxjs';
import { UserData } from 'src/app/shared/interfaces/user.interface';
import { ApiService } from 'src/app/services/api.service';

const PAGINATION_LIMIT = 10;

export interface HomeData {
  user: UserData;
  post: Post
}

interface PostUser {
  [key: number]: Post[]
}

// TODO: split out into services as turning into god service
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  post$: Observable<Post[]>;
  homeData$: Observable<HomeData[]>;

  constructor(private paginationService: PaginationService, private apiService: ApiService) {
    // Move to user service

    const userData$ = this.apiService.userService.loadUsers()
      .pipe(
        map(v => !!v.success ? v.data : MOCK_USERS),
        distinctUntilChanged()
      );

    const postChunkedData$ = this.apiService.postService.loadPosts()
      .pipe(
        map(v => !!v.success ? v.data : MOCK_POSTS),
        map(v => this.chunkArray(v, PAGINATION_LIMIT)),
        distinctUntilChanged()
      );

    // we will use tha pagination as the actionable stream as we don't want to do this transformation for everything instance.

    this.homeData$ = combineLatest(this.paginationService.paginatedState$, postChunkedData$).pipe(
      // withLatestFrom(),
      distinctUntilChanged(),
      map(([paginationState, chunkedArr]) => chunkedArr[paginationState] || []),
      // types inferred no need to define though will for readablity
      map(filteredChunk => this.groupBy<Post>(filteredChunk, 'userId')),
      withLatestFrom(userData$),
      map(([postGroupByUser, userData]) => this.mergeUserWithPosts(postGroupByUser, userData))
    );
  }


  private mergeUserWithPosts(postGroupByUser: PostUser, users: UserData[]): HomeData[] {
    return Object.entries(postGroupByUser).reduce((acc: HomeData[], [keyStr, posts]) => {
      const userVal = this.findUserFromGroupPost(users, keyStr)
      const mergedUserPost = this.transformHomeData(posts, userVal);
      return [...acc, ...mergedUserPost,];
    }, []);
  }

  private transformHomeData(posts: Post[], user: UserData): HomeData[] {
    return posts.map((post): HomeData => ({ user, post }));
  }

  private findUserFromGroupPost(users: UserData[], userPostId: string): UserData {
    const userPostIdNum = parseInt(userPostId);
    return users.find(user => user.id === userPostIdNum);
  }

  // Potentially abstract based on furture usage
  private chunkArray<T>(arr: T[], chunkSize: number): T[][] {
    const numberOfChunksInArr = Math.ceil(arr.length / chunkSize);
    // spread array keys in array to map over
    // check if new array with Index values allow same functionality as spread and keys
    return [...Array(numberOfChunksInArr).keys()]
      .map(instanceInArr => instanceInArr * chunkSize)
      .map(val => arr.slice(val, val + chunkSize));
  }

  // Potentially abstract based on furture usage
  private groupBy<T>(items: T[], key: string): { [key: number]: T[] } {
    return items.reduce((acc, item) => {
      // using es6 spread to concat array, if there isn't an array.
      // if not initial array provide and combine with new Item.
      const accumlatedItems = [
        ...(acc[item[key]] || []),
        item,
      ];
      return {
        ...acc,
        [item[key]]: accumlatedItems
      }
    }, {});
  }
}
