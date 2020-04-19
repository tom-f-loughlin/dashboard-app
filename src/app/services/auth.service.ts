import { Injectable } from '@angular/core';
import { of, Subject, BehaviorSubject, Observable, merge, combineLatest } from 'rxjs';
import { map, filter, shareReplay } from 'rxjs/operators';
import { UserData } from 'src/app/shared/interfaces/user.interface';
import { UserService } from 'src/app/services/user.service';

const STORE_IDENTIFIER = 'USER_TOKEN';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly isLoggedIn$: Observable<boolean>;
  private loginSubject: Subject<string> = new Subject();
  private loggedUserSubject: BehaviorSubject<UserData> = new BehaviorSubject(null);
  readonly logginedInUser$: Observable<UserData> = this.loggedUserSubject.asObservable();

  constructor(private userService: UserService) {

    const localStoredUser$ = of(localStorage.getItem(STORE_IDENTIFIER));
    // We want to allow emissions to login but also ensure that the user is a valid one.
    // we also don't want to store the user data fully to the localstore so we'll just store user name
    const userInfo$ = merge(this.loginSubject, localStoredUser$);

    combineLatest(userInfo$, this.userService.userData$).pipe(
      filter(([userInfo, users]) => users != null),
      map(([userInfo, users]) => [...users].find(user => this.localisationStr(user.username, userInfo)) || null),
    ).subscribe(foundUser => {
      console.log({ foundUser })
      if (foundUser) {
        localStorage.setItem(STORE_IDENTIFIER, foundUser.username);
      }
      this.loggedUserSubject.next(foundUser);
    });

    this.logginedInUser$ = this.loggedUserSubject.asObservable();

    this.isLoggedIn$ = this.loggedUserSubject.asObservable().pipe(
      map(user => user !== null),
      shareReplay(1),
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