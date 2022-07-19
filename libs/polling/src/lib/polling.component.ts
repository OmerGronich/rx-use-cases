import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  catchError,
  first,
  identity,
  interval,
  Observable,
  of,
  repeat,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  takeWhile,
  timer,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface PollingState {
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any[];
}

interface PollingOptions<T> {
  pollingInterval: number;
  completeAfter?: number;
  pollWhile?: (arg: T) => boolean;
  inclusive?: boolean;
}

function poll<T>(options: PollingOptions<T>) {
  return (source$: Observable<T>): Observable<T> => {
    const completeAfter = options.completeAfter
      ? takeUntil(timer(options.completeAfter))
      : identity;
    const pollWhile = options.pollWhile
      ? takeWhile(options.pollWhile, options.inclusive || true)
      : identity;

    return timer(0, options.pollingInterval).pipe(
      completeAfter,
      switchMap(() => source$),
      pollWhile
    );
  };
}

const ONE_SECOND = 1000;
const FORTY_SECONDS = ONE_SECOND * 40;

@Component({
  selector: 'rx-use-cases-polling',
  templateUrl: './polling.component.html',
  styleUrls: ['./polling.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollingComponent {
  private clicksSubject = new Subject<void>();

  polling$ = this.clicksSubject.asObservable().pipe(
    first(),
    switchMap(() => this.prepare()),
    switchMap(() =>
      this.getData().pipe(
        poll<PollingState>({
          pollingInterval: ONE_SECOND,
          completeAfter: FORTY_SECONDS,
          pollWhile: (state) => state.status === 'pending',
        })
      )
    ),
    catchError((e) => of(e.error)),
    repeat()
  );

  constructor(private http: HttpClient) {}

  startPolling() {
    this.clicksSubject.next();
  }

  prepare() {
    return this.http.post<PollingState>('/api/prepare', {});
  }

  getData() {
    return this.http.get<PollingState>('/api/poll');
  }
}
