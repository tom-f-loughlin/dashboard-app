import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { HeaderStrategyService, HeaderState } from 'src/app/services/header-strategy.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from 'src/app/shared/interfaces/post.interface';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from 'src/app/services/post.service';
import { Subscription, Subject } from 'rxjs';
import { sample, filter } from 'rxjs/operators';

interface PostForm {
  title: string;
  message: string;
};

const DEFAULT_FORM_STATE: PostForm = {
  title: '',
  message: ''
};

type ErrorTypeLimits = keyof typeof DEFAULT_FORM_STATE;

const FORM_LIMITS = {
  TITLE: 200,
  MESSAGE: 2000
}
const DEFAULT_MODAL_OPT: NgbModalOptions = {
  backdrop: 'static',
  backdropClass: 'customBackdrop'
}

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit, OnDestroy {
  @ViewChild('deletePostModal') modal: TemplateRef<any>;

  postForm: FormGroup;
  readonly editable: boolean;
  private editPostState: Post;
  private redirectSubscription: Subscription;
  private redirectActionSubject: Subject<void> = new Subject();

  get formControls() { return this.postForm.controls; }

  constructor(
    private headerStrategyService: HeaderStrategyService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private postService: PostService
  ) {
    // Data resolver with posts service will will maitain and handles posts
    this.editPostState = this.activeRoute.snapshot.data.postItem;
    this.editable = this.editPostState != null;
    const postState = this.editable ? HeaderState.POST_EDIT : HeaderState.POST_NEW;
    this.headerStrategyService.headerStateChange(postState);

    // Look to abstract to redirection service
    this.redirectSubscription = this.postService.postData$.pipe(
      sample(this.redirectActionSubject),
      filter(postData => postData != null)
    ).subscribe(_ => {
      this.router.navigateByUrl('/home');
    });
  }

  ngOnInit(): void {
    const { title, message } = this.handleFormState();
    this.postForm = this.formBuilder.group({
      title: [title, [Validators.required, Validators.maxLength(FORM_LIMITS.TITLE)]],
      message: [message, [Validators.required, Validators.maxLength(FORM_LIMITS.MESSAGE)]],
    });
    console.log(this.postForm)
  }

  ngOnDestroy(): void {
    this.redirectSubscription.unsubscribe();
  }

  openRemoveConfirmModal() {
    this.modalService.open(this.modal, DEFAULT_MODAL_OPT).result.then((result) => {
      this.deletePost();
      this.redirectActionSubject.next();
    }, (dismissedReasoning) => {
      // We don't need to handle dismissed as it'll just show the current state/page
    });
  }
  private deletePost() {
    const newState = this.mergeFormStateWithPost(this.postForm.value);
    this.postService.deletePost(newState);
  }

  savePost() {
    if (this.postForm.invalid) {
      return;
    }
    const newState = this.mergeFormStateWithPost(this.postForm.value);
    this.postService.savePost(newState, this.editable);
    this.redirectActionSubject.next();
    // todo alert for home service
  }

  errorLimitFromContext(context: ErrorTypeLimits): string {
    const limit = (() => {
      if (context === 'title') {
        return FORM_LIMITS.TITLE;
      } else if (context === 'message') {
        return FORM_LIMITS.MESSAGE;
      }
    })();

    return `The ${context} cannot exceed more than ${limit} characters!`;
  }

  private mergeFormStateWithPost(form: PostForm): Post {
    const { message, title } = form;
    return { ...this.editPostState, title, body: message };
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
