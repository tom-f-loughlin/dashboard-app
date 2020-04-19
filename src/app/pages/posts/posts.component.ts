import { Component, OnInit } from '@angular/core';
import { HeaderStrategyService, HeaderState } from 'src/app/services/header-strategy.service';
import { ActivatedRoute } from '@angular/router';
import { MOCK_POSTS } from 'src/app/pages/posts/model/posts.mocks';
import { Post } from 'src/app/shared/interfaces/post.interface';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

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

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  postForm: FormGroup;
  closeResult: string;
  // modalRef: BsModalRef;x
  readonly editable: boolean;
  private postState: HeaderState;
  private mockPost = MOCK_POSTS;
  private editPostState: Post;

  modalOptions:NgbModalOptions;

  get formControls() { return this.postForm.controls; }

  get isNotEdit(): boolean {
    return this.postState != HeaderState.POST_EDIT;
  }

  constructor(
    private headerStrategyService: HeaderStrategyService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {
    // Data resolver with posts service will will maitain and handles posts
    const editQuery = this.route.snapshot.queryParamMap.get('edit');
    const postId = parseInt(editQuery);
    this.editPostState = this.mockPost.find(post => post.id === postId);


    this.editable = editQuery != null;
    this.postState = editQuery ? HeaderState.POST_EDIT : HeaderState.POST_NEW;
    this.headerStrategyService.headerStateChange(this.postState);
    this.modalOptions = {
      backdrop:'static',
      backdropClass:'customBackdrop'
    }
  }

  ngOnInit(): void {
    const { title, message } = this.handleFormState();
    this.postForm = this.formBuilder.group({
      title: [title, [Validators.required, Validators.maxLength(FORM_LIMITS.TITLE)]],
      message: [message, [Validators.required, Validators.maxLength(FORM_LIMITS.MESSAGE)]],
    });
    console.log(this.postForm)
  }

  open(content) {
    this.modalService.open(content, this.modalOptions).result.then((result) => {
      alert(result)
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
 
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  savePost() {
    // if (this.postForm.invalid) {
    //   return;
    // }
    // this.authService.login(this.loginForm.value.userName);
    // this.redirectActionSubject.next();

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

  private handleFormState(): PostForm {
    if (this.editPostState) {
      const { title, body } = this.editPostState;
      return { title, message: body };
    } else {
      return DEFAULT_FORM_STATE;
    }
  }

}
