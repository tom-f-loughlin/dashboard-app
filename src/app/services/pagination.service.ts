import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { withLatestFrom, filter, map } from 'rxjs/operators';


export enum PaginationCommands {
  INCREMENET = 0,
  DECREMENT = 1,
}

// Service to take Generic Value that will hold state of paginated values.

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  // pagination state starts at 0 like all array values.
  private paginatedStateSubject: BehaviorSubject<number> = new BehaviorSubject(0);
  private paginatedCommandSubject: Subject<PaginationCommands> = new Subject();
  public readonly paginatedState$: Observable<number>;

  // disable logic in component.
  constructor() {
    this.paginatedState$ = this.paginatedStateSubject.asObservable();

    this.paginatedCommandSubject.pipe(
      withLatestFrom(this.paginatedStateSubject),
      filter(([command, state]) => this.commandStateFilter(command, state)),
      map(([command, state]) => this.commandHandler(command, state))
    ).subscribe(newState => {
      console.log({ newState })
      this.paginatedStateSubject.next(newState);
    });
  }

  paginatedChange(command: PaginationCommands) {
    this.paginatedCommandSubject.next(command);
  }

  private commandStateFilter(command: PaginationCommands, state: number): boolean {
    console.log(command, state, command !== PaginationCommands.DECREMENT, state !== 0);
    return command !== PaginationCommands.DECREMENT ? true : state !== 0;
  }

  private commandHandler(command: PaginationCommands, state: number): number {
    switch (command) {
      case PaginationCommands.DECREMENT:
        return state - 1;
      case PaginationCommands.INCREMENET:
        return state + 1;
      default:
        const neverGetHere: never = command;
    }
  }
}
