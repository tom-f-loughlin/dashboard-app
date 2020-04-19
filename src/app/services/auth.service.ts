import { Injectable } from '@angular/core';
import { MOCK_USERS } from 'src/app/pages/home/model/login.mock';
import { of, Subject, BehaviorSubject, Observable, merge } from 'rxjs';
import { map, withLatestFrom, filter, tap, startWith, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { UserData } from 'src/app/shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  readonly isLoggedIn$: Observable<boolean>;
  private loginSubject: Subject<string> = new Subject();
  private loggedUserSubject: BehaviorSubject<UserData> = new BehaviorSubject(null);
  readonly logginedInUser$: Observable<UserData> = this.loggedUserSubject.asObservable();

  constructor() {

    const mockUsers$ = of(MOCK_USERS);
    const localStoredUser$ = of(localStorage.getItem('ACCESS_TOKEN'));

    merge(this.loginSubject, localStoredUser$).pipe(
      withLatestFrom(mockUsers$),
      filter(([userInfo, users]) => users != null),
      map(([userInfo, users]) => [...users].find(user => this.localisationStr(user.username, userInfo)) || null),
      distinctUntilChanged()
    ).subscribe(foundUser => {
      console.log({ foundUser })
      this.loggedUserSubject.next(foundUser);
    });

    this.isLoggedIn$ = this.loggedUserSubject.asObservable().pipe(
      map(user => user !== null),
      shareReplay(1),
    );
    // request user data
  }

  login(userInfo: string) {
    this.loginSubject.next(userInfo);
    // const mockUsers$ = of(MOCK_USERS);
    // const hey = mockUsers$.pipe(
    //   first(users => !users),
    //   map(v => v.find(user => user.username = userInfo))
    // )
    // const foundUser = MOCK_USERS.find(v => v.username = userInfo);
    // if (foundUser) {
    //   localStorage.setItem('ACCESS_TOKEN', "access_token");
    // }
  }

  logout() {
    localStorage.clear();
  }

  loggedUser() {
    return this.loggedUserSubject.getValue();
  }

  checkIsLogged(): boolean {
    return this.loggedUserSubject.getValue() !== null;
  }

  // export to utils
  private localisationStr(strRef1: string, strRef2: string): boolean {
    return strRef1.localeCompare(strRef2) === 0;
  }

  private parseJsonLocal() {
    return JSON.parse(localStorage.getItem('user'));
  }

  private isLoggedIn(): boolean {
    return localStorage.getItem('ACCESS_TOKEN') !== null;

  }
}