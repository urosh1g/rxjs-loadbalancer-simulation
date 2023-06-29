import { Observer, Subject, Subscription } from "rxjs";
import { Server } from "./Server";
import { IncomingRequest } from "./IncomingRequest";
import { MAX_CPU_LOAD, MAX_MEM_LOAD } from "./LoadRequirement";

class LoadBalancer implements Observer<IncomingRequest> {
    servers: Array<Server>;
    requestEmitter: Subject<IncomingRequest>;
    sub: Subscription;

    constructor() {
        this.servers = new Array<Server>(
            new Server(1)
        );
        document.body.appendChild(this.servers[this.servers.length - 1].draw());
        this.requestEmitter = new Subject();
        this.sub = this.requestEmitter.subscribe(request => {
            let canHandle = this.servers.filter(server =>
                server.load.cpuLoad + request.loadRequirements.cpuLoad < MAX_CPU_LOAD &&
                server.load.memoryLoad + request.loadRequirements.memoryLoad < MAX_MEM_LOAD
            );
            if (canHandle.length == 0) {
                console.error("Request can't be handled by existing servers");
                console.error("Creating a new server");
                this.servers.push(new Server(this.servers.length + 1));
                document.body.appendChild(this.servers[this.servers.length - 1].draw());
                console.error("Handling by new server");
                this.servers[this.servers.length - 1].next(request);
            }
            else {
                let server = canHandle.reduce((prev, curr) => {
                    return this.minServer(prev, curr);
                });
                server.next(request);
            }
        });
    }

    next(value: IncomingRequest) {
        this.requestEmitter.next(value);
    }

    private minServer(first: Server, second: Server): Server {
        return first.load.cpuLoad < second.load.cpuLoad &&
            first.load.memoryLoad < second.load.memoryLoad ?
            first : second;
    }

    error: (err: any) => void;

    complete() {
        this.sub.unsubscribe();
    }
}

export { LoadBalancer }