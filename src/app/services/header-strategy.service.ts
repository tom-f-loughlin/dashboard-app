import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


// strings to be taken from translations object
export enum HeaderState {
  LOGIN = 'Login',
  HOME = 'Home',
  POST_EDIT = 'Edit Post',
  POST_NEW = 'New Post',
}

@Injectable({
  providedIn: 'root'
})
export class HeaderStrategyService {

  // Currently have null for default state to allow for angular route to handle state emission
  private headerStateSubject: BehaviorSubject<HeaderState> = new BehaviorSubject(null);
  public readonly headerState$: Observable<HeaderState>;

  constructor() {
    this.headerStateSubject.next(HeaderState.HOME);
    this.headerState$ = this.headerStateSubject.asObservable();
  }

  headerStateChange(state: HeaderState) {
    this.headerStateSubject.next(state);
  }
}
