import { Component } from '@angular/core';
import { HomeService, HomeData } from 'src/app/services/home.service';
import { Observable } from 'rxjs';
import { PaginationService, PaginationCommands } from 'src/app/services/pagination.service';
import { HeaderStrategyService, HeaderState } from 'src/app/services/header-strategy.service';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { UserService } from 'src/app/services/user.service';
// temp look into better solution
const HTTPS_EXTENERAL_TRIGGER = 'http://'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  readonly data$: Observable<HomeData[]>;
  readonly paginationCommands = PaginationCommands;
  readonly isLoggedIn$: Observable<boolean>;
  readonly nextDisabled$: Observable<boolean>;
  readonly previousDisabled$: Observable<boolean>;

  constructor(
    private homeService: HomeService,
    private paginationService: PaginationService,
    private headerStrategyService: HeaderStrategyService,
    private auth: AuthService, 
    private postService: PostService,
    private userService: UserService
  ) {
    this.headerStrategyService.headerStateChange(HeaderState.HOME);
    this.data$ = this.homeService.homeData$;
    this.nextDisabled$ = this.homeService.nextDisabled$;
    this.previousDisabled$ = this.homeService.previousDisabled$;
    this.isLoggedIn$ = this.auth.isLoggedIn$;
  }

  paginationClick(command: PaginationCommands) {
    this.paginationService.paginatedChange(command)
  }

  linkHandler(lineItem: HomeData): string {
    return `${HTTPS_EXTENERAL_TRIGGER}${lineItem.user.website}`;
  }

}
