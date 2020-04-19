import { Component, OnInit } from '@angular/core';
import { HeaderStrategyService, HeaderState } from 'src/app/services/header-strategy.service';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserData } from 'src/app/shared/interfaces/user.interface';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  readonly headerState = HeaderState;
  readonly user$: Observable<UserData>;
  readonly title$: Observable<string>;

  constructor(private headerStrategyService: HeaderStrategyService, private auth: AuthService) {
    this.title$ = this.headerStrategyService.headerState$;
    this.user$ = this.auth.logginedInUser$;
  }

  ngOnInit(): void {
  }

  logout() {
    this.auth.logout()
  }

}
