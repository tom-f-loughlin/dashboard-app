import { Injectable } from '@angular/core';
import { Post } from 'src/app/shared/interfaces/post.interface';
import { PaginationService } from 'src/app/services/pagination.service';
import { map, withLatestFrom, distinctUntilChanged } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { UserData } from 'src/app/shared/interfaces/user.interface';
import { UserService } from 'src/app/services/user.service';
import { PostService } from 'src/app/services/post.service';

export interface HomeData {
  user: UserData;
  post: Post;
};

interface PostUser {
  [key: number]: Post[];
};

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  readonly homeData$: Observable<HomeData[]>;
  readonly previousDisabled$: Observable<boolean>;
  readonly nextDisabled$: Observable<boolean>;

  constructor(private paginationService: PaginationService, private postService: PostService, private userService: UserService) {

    // we will use tha pagination as the actionable stream as we don't want to do this transformation for everything instance.
    this.homeData$ = combineLatest(this.paginationService.paginatedState$, this.postService.postDataChunked$).pipe(
      distinctUntilChanged(),
      map(([paginationState, chunkedArr]) => chunkedArr[paginationState] || []),
      // types inferred no need to define though will for readablity
      map(filteredChunk => this.groupBy<Post>(filteredChunk, 'userId')),
      withLatestFrom(this.userService.userData$),
      map(([postGroupByUser, userData]) => this.mergeUserWithPosts(postGroupByUser, userData))
    );

    this.previousDisabled$ = this.paginationService.paginatedState$.pipe(
      map(paginationState => paginationState === 0),
    );
    this.nextDisabled$ = this.paginationService.paginatedState$.pipe(
      withLatestFrom(this.postService.postDataChunked$),
      map(([paginnationState, chunks]) => (chunks.length - 1) === paginnationState),
    );
  }


  private mergeUserWithPosts(postGroupByUser: PostUser, users: UserData[]): HomeData[] {
    return Object.entries(postGroupByUser).reduce((acc: HomeData[], [keyStr, posts]) => {
      const userVal = this.findUserFromGroupPost(users, keyStr)
      if (userVal) {
        const mergedUserPost = this.transformHomeData(posts, userVal);
        return [...acc, ...mergedUserPost,];
      }
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
