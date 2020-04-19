import { Injectable } from '@angular/core';
import { Post } from 'src/app/shared/interfaces/post.interface';
import { Observable, BehaviorSubject } from 'rxjs';
import { MOCK_POSTS } from 'src/app/shared/mocks/posts.mocks';
import { distinctUntilChanged, map, shareReplay, filter } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

const PAGINATION_LIMIT = 10;

@Injectable({
  providedIn: 'root'
})
export class PostService {

  readonly postData$: Observable<Post[]>;
  readonly postDataChunked$: Observable<Post[][]>;
  private postsDataSubject: BehaviorSubject<Post[]> = new BehaviorSubject(null);

  constructor(private apiService: ApiService) {

    this.apiService.postService.loadPosts()
      .pipe(
        map(response => !!response.success ? response.data : MOCK_POSTS),
        distinctUntilChanged()
      ).subscribe(userdata => {
        this.postsDataSubject.next(userdata);
      })

    this.postData$ = this.postsDataSubject.asObservable().pipe(
      shareReplay(1)
    );

    this.postDataChunked$ = this.postData$.pipe(
      filter(v => !!v),
      map(postData => this.chunkArray(postData, PAGINATION_LIMIT))
    );
  }

  savePost(postItem: Post, isEdit = false) {
    console.log({ saveVal: postItem });

    const arr = this.swallowClonedData();
    const handleSaveType = () => {
      if (isEdit) {
        return arr.map(post => {
          if (post.id === postItem.id) {
            const test = { ...post, ...postItem };
            console.log({ test });
            return test;
          } else {
            return post;
          }
        })
      } else {
        return arr.concat(postItem);
      }
    }
    const edittedArr = handleSaveType();
    this.postsDataSubject.next(edittedArr);
  }

  deletePost(postItem: Post) {
    console.log({ removeVal: postItem });
    // remove through filtering.
    const removeItemArr = (() => {
      const concatArrPosts = this.swallowClonedData();
      return concatArrPosts.filter(post => post.id !== postItem.id);
    })();

    this.postsDataSubject.next(removeItemArr);
  }

  private swallowClonedData(): Post[] {
    return [...(this.postsDataSubject.getValue())];
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
}
