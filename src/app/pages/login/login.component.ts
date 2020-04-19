import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderStrategyService, HeaderState } from 'src/app/services/header-strategy.service';
import { filter, sample } from 'rxjs/operators';
import { Subscription, Subject, Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

export interface User {
  userName: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  isSubmitted = false;
  hasUserData$: Observable<boolean>;
  private formChangeSubscription: Subscription;
  private redirectSubscription: Subscription;
  private redirectActionSubject: Subject<void> = new Subject();

  get formControls() { return this.loginForm.controls; }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private headerStrategyService: HeaderStrategyService,
    private authService: AuthService
  ) {

    this.headerStrategyService.headerStateChange(HeaderState.LOGIN);

    this.redirectSubscription = this.authService.logginedInUser$.pipe(
      sample(this.redirectActionSubject),
      filter(userData => userData != null)
    ).subscribe(_ => {
      this.router.navigateByUrl('/home');
    });

    this.hasUserData$ = this.authService.isLoggedIn$;
  }

  // private authService: AuthService, private router: Router make resolvre
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
    });

    // Alternatively could create a stream and async on the template.
    this.formChangeSubscription = this.loginForm.valueChanges.pipe(
      filter(_ => this.isSubmitted),
    ).subscribe(_ => {
      // if this gets complicated best to debounce 
      this.isSubmitted = false;
    });
  }

  ngOnDestroy(): void {
    this.formChangeSubscription.unsubscribe();
    this.redirectSubscription.unsubscribe();
  }


  processLogin() {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.authService.login(this.loginForm.value.userName);
    this.redirectActionSubject.next();
  }

}
