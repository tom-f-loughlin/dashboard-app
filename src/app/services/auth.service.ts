import { Injectable } from '@angular/core';
import { MOCK_USERS } from 'src/app/pages/home/model/login.mock';
import { of, Subject, BehaviorSubject, Observable, merge } from 'rxjs';
import { map, withLatestFrom, filter, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { UserData } from 'src/app/shared/interfaces/user.interface';

const STORE_IDENTIFIER = 'USER_TOKEN';
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
    const localStoredUser$ = of(localStorage.getItem(STORE_IDENTIFIER));

    // We want to allow emissions to login but also ensure that the user is a valid one.
    // we also don't want to store the user data fully to the localstore so we'll just store user name
    merge(this.loginSubject, localStoredUser$).pipe(
      withLatestFrom(mockUsers$),
      filter(([userInfo, users]) => users != null),
      map(([userInfo, users]) => [...users].find(user => this.localisationStr(user.username, userInfo)) || null),
    ).subscribe(foundUser => {
      console.log({ foundUser })
      if (foundUser) {
        localStorage.setItem(STORE_IDENTIFIER, foundUser.username);
      }
      this.loggedUserSubject.next(foundUser);
    });

    this.isLoggedIn$ = this.loggedUserSubject.asObservable().pipe(
      shareReplay(1),
      map(user => user !== null)
    );
  }

  login(userInfo: string) {
    this.loginSubject.next(userInfo);
  }

  logout() {
    if (this.checkIsLogged) {
      this.loggedUserSubject.next(null);
    }
    localStorage.clear();
  }

  private checkIsLogged(): boolean {
    return this.loggedUserSubject.getValue() !== null;
  }

  //todo: export to utils
  private localisationStr(strRef1: string, strRef2: string): boolean {
    return strRef1.localeCompare(strRef2) === 0;
  }
}