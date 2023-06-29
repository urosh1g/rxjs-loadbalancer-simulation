import { Observer } from "rxjs";
import { IncomingRequest } from "./IncomingRequest";
import { LoadRequirement } from "./LoadRequirement";

type ServerLoad = LoadRequirement;

class Server implements Observer<IncomingRequest> {
    id: number;
    load: ServerLoad;

    constructor(id: number) {
        this.id = id;
        this.load = {
            cpuLoad: 0,
            memoryLoad: 0
        };
    }

    draw(): HTMLDivElement {
        let serverDiv = document.createElement("div");
        let text = document.createElement("p");
        serverDiv.id = `${this.id}`;
        text.innerText = `Server ${this.id}`;
        serverDiv.appendChild(text);
        return serverDiv;
    }

    next(value: IncomingRequest) {
        this.handleRequest(value);
    }

    error: (err: any) => void;
    complete: () => void;

    private handleLoad(requirements: LoadRequirement) {
        this.load.cpuLoad += requirements.cpuLoad;
        this.load.memoryLoad += requirements.memoryLoad;
    }

    private releaseLoad(requirements: LoadRequirement) {
        this.load.cpuLoad -= requirements.cpuLoad;
        this.load.memoryLoad -= requirements.memoryLoad;
    }

    private handleRequest(request: IncomingRequest) {
        console.log(`Server ${this.id} handling request ${request.name}`);
        this.handleLoad(request.loadRequirements);
        setTimeout(() => {
            console.log(`Server ${this.id} finished handling request ${request.name}`);
            this.releaseLoad(request.loadRequirements);
        }, Math.random() * 5000);
    }
}

export { Server }