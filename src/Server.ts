import { Observer, asapScheduler } from "rxjs";
import { IncomingRequest } from "./IncomingRequest";
import { LoadRequirement } from "./LoadRequirement";

type ServerLoad = LoadRequirement;
type HTMLComponent = {
    parent: HTMLDivElement,
    displayElement: HTMLParagraphElement
};

class Server implements Observer<IncomingRequest> {
    id: number;
    load: ServerLoad;
    private display: HTMLComponent;

    constructor(id: number) {
        this.id = id;
        this.load = {
            cpuLoad: 0,
            memoryLoad: 0
        };
        this.initializeDisplay();
    }

    draw(parent: HTMLElement) {
        parent.appendChild(this.display.parent);
    }

    next(value: IncomingRequest) {
        this.handleRequest(value);
    }

    error: (err: any) => void;
    complete: () => void;

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
        asapScheduler.schedule(() => {
            console.log(`Server ${this.id} finished handling request ${serializedRequest}`);
            this.releaseLoad(request.loadRequirements);
        }, Math.random() * 5000);
    }

    private setColor() {
        const loadLevel = Math.max(this.load.cpuLoad, this.load.memoryLoad);
        if(loadLevel < 33) {
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