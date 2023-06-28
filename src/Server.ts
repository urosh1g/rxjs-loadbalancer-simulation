import { Observer } from "rxjs";
import { IncomingRequest } from "./IncomingRequest";
import { LoadRequirement } from "./LoadRequirement";

type ServerLoad = LoadRequirement;

class Server implements Observer<IncomingRequest> {
    public load: ServerLoad;

    constructor() {
        this.load = {
            cpuLoad: 0,
            memoryLoad: 0
        };
    }

    next(value: IncomingRequest) {
        this.handleRequest(value);
    }

    error: (err: any) => void;
    complete: () => void;

    private handleLoad(requirements: LoadRequirement) {
        this.load.cpuLoad -= requirements.cpuLoad;
        this.load.memoryLoad -= requirements.memoryLoad;
    }

    private releaseLoad(requirements: LoadRequirement) {
        this.load.cpuLoad += requirements.cpuLoad;
        this.load.memoryLoad += requirements.memoryLoad;
    }

    private handleRequest(request: IncomingRequest) {
        console.log(`Server handling request ${request.name}`);
        this.handleLoad(request.loadRequirements);
        setTimeout(() => {
            console.log(`Server finished handling request ${request.name}`);
            this.releaseLoad(request.loadRequirements);
        }, Math.random() * 1000);
    }
}

export { Server }