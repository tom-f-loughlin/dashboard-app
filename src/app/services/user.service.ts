import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { MOCK_USERS } from 'src/app/shared/mocks/user.mock';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserData } from 'src/app/shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly userData$: Observable<UserData[]>;
  private userDataSubject: BehaviorSubject<UserData[]> = new BehaviorSubject(null);

  constructor(private apiService: ApiService) {

    this.apiService.userService.loadUsers()
      .pipe(
        map(response => !!response.success ? response.data : MOCK_USERS),
        distinctUntilChanged()
      ).subscribe(userdata => {
        this.userDataSubject.next(userdata);
      })

    this.userData$ = this.userDataSubject.asObservable().pipe(
      shareReplay(1)
    )
  }
}
