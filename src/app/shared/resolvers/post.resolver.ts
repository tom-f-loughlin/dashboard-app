import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/shared/interfaces/post.interface';


// For correct implementation accessible routes need to be nested
@Injectable()
export class PostResolver implements Resolve<Post> {
    
    constructor(private postService: PostService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<Post> {
        // return this.auth.isLoggedIn$.pipe(first());
        const editQuery = route.queryParamMap.get('edit');
        const postId = parseInt(editQuery);
        return this.postService.postData$.pipe(
            map(postData => postData.find(post => post.id === postId)),
            first()
        );
    }
}