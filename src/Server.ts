import { Observer, Subject, asapScheduler, throwError, timeout } from "rxjs";
import { IncomingRequest } from "./IncomingRequest";
import { LoadRequirement } from "./LoadRequirement";
import { LoadBalancer } from "./LoadBalancer";

type ServerLoad = LoadRequirement;
type HTMLComponent = {
    parent: HTMLDivElement,
    displayElement: HTMLParagraphElement
};

class Server implements Observer<IncomingRequest> {
    id: number;
    load: ServerLoad;
    private display: HTMLComponent;
    private loadBalancer: LoadBalancer; // necessary for reporting inactivity
    private state$: Subject<ServerLoad>;

    constructor(id: number, loadBalancer: LoadBalancer) {
        this.id = id;
        this.loadBalancer = loadBalancer;
        this.load = {
            cpuLoad: 0,
            memoryLoad: 0
        };
        this.initializeDisplay();
        this.state$ = new Subject<ServerLoad>();
        this.startStateManagement();
    }

    draw(parent: HTMLElement) {
        parent.appendChild(this.display.parent);
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
        this.state$.pipe(
            timeout({
                each: 10_000,
                with: () => throwError(() => new Error(`Server ${this.id} inactive for 10 seconds`))
            })
        ).subscribe({
            error: (_: Error) => {
                this.loadBalancer.remove(this);
            }
        });
    }

    private initializeDisplay() {
        this.display = {
            parent: document.createElement("div"),
            displayElement: document.createElement("p")
        };
        this.display.parent.id = `${this.id}`;
        this.display.displayElement.classList.add("green-server");
        this.display.displayElement.innerText = `Server ${this.id} CPU: ${this.load.cpuLoad} MEM: ${this.load.memoryLoad}`;
        this.display.parent.appendChild(this.display.displayElement);
    }

    private handleLoad(requirements: LoadRequirement) {
        this.load.cpuLoad += requirements.cpuLoad;
        this.load.memoryLoad += requirements.memoryLoad;
        this.display.displayElement.innerText = `Server ${this.id} CPU: ${this.load.cpuLoad} MEM: ${this.load.memoryLoad}`;
        this.setColor();
    }

    private releaseLoad(requirements: LoadRequirement) {
        this.load.cpuLoad -= requirements.cpuLoad;
        this.load.memoryLoad -= requirements.memoryLoad;
        this.display.displayElement.innerText = `Server ${this.id} CPU: ${this.load.cpuLoad} MEM: ${this.load.memoryLoad}`;
        this.setColor();
    }

    private handleRequest(request: IncomingRequest) {
        let serializedRequest = JSON.stringify(request);
        console.log(`Server ${this.id} handling request ${serializedRequest}`);
        this.handleLoad(request.loadRequirements);
        this.state$.next(this.load);
        /*
            Simulate request handling as an asynchronous operation
            with random time between 0-5 sec
        */
        asapScheduler.schedule(() => {
            console.log(`Server ${this.id} finished handling request ${serializedRequest}`);
            this.releaseLoad(request.loadRequirements);
        }, Math.random() * 5000);
    }

    private setColor() {
        const loadLevel = Math.max(this.load.cpuLoad, this.load.memoryLoad);
        if (loadLevel < 33) {
            this.display.displayElement.className = "green-server";
        }
        else if (loadLevel < 66) {
            this.display.displayElement.className = "orange-server";
        }
        else {
            this.display.displayElement.className = "red-server";
        }
    }
}

export { Server }