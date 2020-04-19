import { Component, OnInit } from '@angular/core';
import { HeaderStrategyService, HeaderState } from 'src/app/services/header-strategy.service';
import { ActivatedRoute } from '@angular/router';
import { MOCK_POSTS } from 'src/app/pages/posts/model/posts.mocks';
import { Post } from 'src/app/shared/interfaces/post.interface';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

interface PostForm {
  title: string;
  message: string;
};

const DEFAULT_FORM_STATE: PostForm = {
  title: '',
  message: ''
};

const FORM_LIMITS = {
  TITLE: 200,
  MESSAGE: 2000
}

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  postForm: FormGroup;
  // modalRef: BsModalRef;x
  readonly editable: boolean;
  private postState: HeaderState;
  private mockPost = MOCK_POSTS;
  private editPostState: Post;

  constructor(
    private headerStrategyService: HeaderStrategyService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    // Data resolver with posts service will will maitain and handles posts
    const editQuery = this.route.snapshot.queryParamMap.get('edit');
    const postId = parseInt(editQuery);
    this.editPostState = this.mockPost.find(post => post.id === postId);


    this.editable = editQuery != null;
    this.postState = editQuery ? HeaderState.POST_EDIT : HeaderState.POST_NEW;
    this.headerStrategyService.headerStateChange(this.postState);

  }

  ngOnInit(): void {
    const { title, message } = this.handleFormState();
    this.postForm = this.formBuilder.group({
      title: [title, [Validators.required, Validators.maxLength(FORM_LIMITS.TITLE)]],
      message: [message, [Validators.required, Validators.maxLength(FORM_LIMITS.MESSAGE)]],
    });
  }


  savePost() {
    // if (this.loginForm.invalid) {
    //   return;
    // }
    // this.authService.login(this.loginForm.value.userName);
    // this.redirectActionSubject.next();

  }

  confirmDelete() {
    
  }

  private handleFormState(): PostForm {
    if (this.editPostState) {
      const { title, body } = this.editPostState;
      return { title, message: body };
    } else {
      return DEFAULT_FORM_STATE;
    }
  }

}
