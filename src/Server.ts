import { Observer, Subject, asyncScheduler, throwError, timeout } from "rxjs";
import { IncomingRequest } from "./IncomingRequest";
import { LoadRequirement } from "./LoadRequirement";
import { LoadBalancer } from "./LoadBalancer";
import { ServerPreviewComponent } from "./components/ServerPreviewComponent";
import { generateRandom, setBackground } from "./utils";

type ServerLoad = LoadRequirement;

class Server implements Observer<IncomingRequest> {
  id: number;
  load: ServerLoad;
  private display: ServerPreviewComponent;
  private loadBalancer: LoadBalancer; // necessary for reporting inactivity
  public state$: Subject<ServerLoad>;

  constructor(id: number, loadBalancer: LoadBalancer) {
    this.id = id;
    this.loadBalancer = loadBalancer;
    this.display = new ServerPreviewComponent(this.id);
    this.load = {
      cpuLoad: 0,
      memoryLoad: 0,
    };
    this.state$ = new Subject<ServerLoad>();
    this.startStateManagement();
  }

  draw(parent: HTMLElement) {
    this.display.draw(parent);
  }

  next(value: IncomingRequest) {
    this.handleRequest(value);
  }

  error: (err: any) => void;
  complete: () => void;

  /*
        If server state hasn't been changed for 10sec
        (no incoming requests to handle)
        this server should not be active anymore
    */
  private startStateManagement() {
    this.state$
      .pipe(
        timeout({
          each: 10_000,
          with: () =>
            throwError(
              () => new Error(`Server ${this.id} inactive for 10 seconds`)
            ),
        })
      )
      .subscribe({
        next: (requirements) => {
          this.display.cpuBar.barContent.style.height = `${requirements.cpuLoad}%`;
          setBackground(this.display.cpuBar.barContent, requirements.cpuLoad);
          this.display.memBar.barContent.style.height = `${requirements.memoryLoad}%`;
          setBackground(
            this.display.memBar.barContent,
            requirements.memoryLoad
          );
        },
        error: (_: Error) => {
          this.loadBalancer.remove(this);
        },
      });
  }

  private handleLoad(requirements: LoadRequirement) {
    this.load.cpuLoad += requirements.cpuLoad;
    this.load.memoryLoad += requirements.memoryLoad;
    this.state$.next(this.load);
  }

  private releaseLoad(requirements: LoadRequirement) {
    this.load.cpuLoad -= requirements.cpuLoad;
    this.load.memoryLoad -= requirements.memoryLoad;
    this.state$.next(this.load);
  }

  private handleRequest(request: IncomingRequest) {
    let serializedRequest = JSON.stringify(request);
    //console.log(`Server ${this.id} handling request ${serializedRequest}`);
    this.handleLoad(request.loadRequirements);
    /*
            Simulate request handling as an asynchronous operation
            with random time between 1-5 sec
        */
    asyncScheduler.schedule(() => {
      //console.log(`Server ${this.id} finished handling request ${serializedRequest}`);
      this.releaseLoad(request.loadRequirements);
    }, generateRandom(1000, 5000));
  }
}

export { Server };
