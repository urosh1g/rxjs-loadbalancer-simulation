import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Observer,
  Subject,
  Subscription,
  asapScheduler,
  catchError,
  filter,
  map,
  merge,
  switchMap,
  throwError,
  withLatestFrom,
} from "rxjs";
import { Server } from "./Server";
import { IncomingRequest } from "./IncomingRequest";
import { LoadRequirement, MAX_CPU_LOAD, MAX_MEM_LOAD } from "./LoadRequirement";

type ServerState = LoadRequirement;

class LoadBalancer implements Observer<IncomingRequest> {
  private servers: Array<Server> = [];
  private requestEmitter: Subject<IncomingRequest> =
    new Subject<IncomingRequest>();
  private bestServer$: BehaviorSubject<Server> | null = null;
  private serverStates$: Array<
    Observable<{ index: number; state: ServerState }>
  >;
  private requestSubscription: Subscription = Subscription.EMPTY;
  private serverStateSubscription: Subscription = Subscription.EMPTY;
  private nextId: number = 1;
  private parent: HTMLElement;

  constructor(parent?: HTMLElement) {
    if (parent) {
      this.parent = parent;
    } else {
      parent = document.body;
    }
    this.addNewServer();
    this.requestSubscription = this.requestEmitter
      .pipe(
        withLatestFrom(this.bestServer$),
        filter(([request, server]) => server !== null || server !== undefined),
        switchMap(([request, server]) => {
          if (!server) return EMPTY;
          if (
            server.load.cpuLoad + request.loadRequirements.cpuLoad <
              MAX_CPU_LOAD &&
            server.load.memoryLoad + request.loadRequirements.memoryLoad <
              MAX_MEM_LOAD
          ) {
            asapScheduler.schedule(() => server.next(request));
          } else {
            const server = this.addNewServer();
            asapScheduler.schedule(() => server.next(request));
          }
          return EMPTY;
        }),
        catchError((error) => {
          console.error(`'error: ${error}`);
          return throwError(() => error);
        })
      )
      .subscribe();
  }

  /*
        Incoming Request, emit to a server
    */
  next(value: IncomingRequest) {
    this.requestEmitter.next(value);
  }
  error: (err: any) => void;
  complete() {
    this.requestSubscription.unsubscribe();
  }

  private minLoad(first: Server, second: Server): Server {
    return first.load.cpuLoad < second.load.cpuLoad &&
      first.load.memoryLoad < second.load.memoryLoad
      ? first
      : second;
  }

  /*
        Remove provided server instance from the DOM
        and from the server list
    */
  remove(server: Server) {
    const best = this.bestServer$.value;
    if (!best || best.id === server.id) {
      this.bestServer$.next(
        this.servers
          .filter((s) => s.id !== server.id)
          .reduce((acc, curr) => this.minLoad(acc, curr))
      );
    }
    let domElem = document.getElementById(`${server.id}`);
    if (domElem) {
      domElem.classList.add("fadeOut");
      setTimeout(() => {
        domElem.remove();
      }, 1000);
    }
    let serverToRemove = this.servers.find((srv) => srv.id == server.id);
    if (serverToRemove) {
      const idx = this.servers.indexOf(serverToRemove);
      this.servers.splice(idx, 1);
    }
  }

  private watchServers() {
    this.serverStates$ = this.servers.map((server, index) =>
      server.state$.asObservable().pipe(map((state) => ({ index, state })))
    );
    this.serverStateSubscription.unsubscribe();
    this.serverStateSubscription = merge(...this.serverStates$)
      .pipe(
        withLatestFrom(this.bestServer$.asObservable()),
        switchMap(([serverInfo, best]) => {
          if (!best) return EMPTY;
          if (
            serverInfo.state.cpuLoad < best.load.cpuLoad &&
            serverInfo.state.memoryLoad < best.load.memoryLoad
          ) {
            this.bestServer$.next(this.servers[serverInfo.index]);
          }
          return EMPTY;
        }),
        catchError((error) => {
          console.error(`'error: ${error}`);
          return throwError(() => error);
        })
      )
      .subscribe();
  }

  private addNewServer(): Server {
    const server = new Server(this.nextId++, this);
    this.servers.push(server);
    if (!this.bestServer$ || this.bestServer$.getValue() === undefined) {
      this.bestServer$ = new BehaviorSubject(server);
      this.bestServer$.next(server);
    }
    this.watchServers();
    server.draw(this.parent);
    return server;
  }
}

export { LoadBalancer };
