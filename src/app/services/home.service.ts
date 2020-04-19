import { Injectable } from '@angular/core';
import { MOCK_USERS } from 'src/app/pages/home/model/login.mock';
import { MOCK_POSTS } from 'src/app/pages/posts/model/posts.mocks';
import { Post } from 'src/app/shared/interfaces/post.interface';
import { PaginationService } from 'src/app/services/pagination.service';
import { map, withLatestFrom, distinctUntilChanged } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UserData } from 'src/app/shared/interfaces/user.interface';

const PAGINATION_LIMIT = 10;

export interface HomeData {
  user: UserData;
  post: Post
}

interface PostUser {
  [key: number]: Post[]
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  // chunk and combine user with posts 

  // temp
  private mockUser = MOCK_USERS;
  private mockPost = MOCK_POSTS;
  post$: Observable<Post[]>;
  homeData$: Observable<HomeData[]>;

  constructor(private paginationService: PaginationService) {
    // replace with API request
    const chunkedArray = this.chunkArray(this.mockPost, PAGINATION_LIMIT)

    // we will use tha pagination as the actionable stream as we don't want to do this transformation for everything instance.
    this.homeData$ = this.paginationService.paginatedState$.pipe(
      withLatestFrom(of(chunkedArray)),
      distinctUntilChanged(),
      map(([paginationState, chunkedArr]) => chunkedArr[paginationState] || []),
      // types inferred no need to define though will for readablity
      map(filteredChunk => this.groupBy<Post>(filteredChunk, 'userId')),
      map(postGroupByUser => this.mergeUserWithPosts(postGroupByUser))
    );
  }


  private mergeUserWithPosts(postGroupByUser: PostUser, users = this.mockUser): HomeData[] {
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
