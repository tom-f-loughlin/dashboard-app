import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/shared/interfaces/post.interface';
import { MOCK_POSTS } from 'src/app/pages/posts/model/posts.mocks';
import { HomeService, HomeData } from 'src/app/services/home.service';
import { Observable } from 'rxjs';
import { PaginationService, PaginationCommands } from 'src/app/services/pagination.service';
import { HeaderStrategyService, HeaderState } from 'src/app/services/header-strategy.service';

// probably better way
const HTTPS_EXTENERAL_TRIGGER = 'http://'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  data$: Observable<HomeData[]>;
  paginationCommands = PaginationCommands;

  // remove for component
  constructor(private homeService: HomeService, private paginationService: PaginationService, private headerStrategyService: HeaderStrategyService) {
  }

  ngOnInit(): void {
    this.headerStrategyService.headerStateChange(HeaderState.HOME);
    this.data$ = this.homeService.homeData$;
  }

  paginationClick(command: PaginationCommands) {
    this.paginationService.paginatedChange(command)
  }


  linkHandler(lineItem: HomeData): string {
    return `${HTTPS_EXTENERAL_TRIGGER}${lineItem.user.website}`;
  }

}
