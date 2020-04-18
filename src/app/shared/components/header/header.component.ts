import { Component, OnInit } from '@angular/core';
import { HeaderStrategyService, HeaderState } from 'src/app/services/header-strategy.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public readonly headerState = HeaderState;
  public readonly title$: Observable<string>;

  constructor(private headerStrategyService: HeaderStrategyService) {
    this.title$ = this.headerStrategyService.headerState$;
  }

  ngOnInit(): void {
  }

}
