import { Observer, Subject, Subscription, asapScheduler, concatMap, filter, from, reduce } from "rxjs";
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
            let server: Server;

            from(this.servers).pipe(
                filter((server) => {
                    return server.load.cpuLoad + request.loadRequirements.cpuLoad < MAX_CPU_LOAD &&
                        server.load.memoryLoad + request.loadRequirements.memoryLoad < MAX_MEM_LOAD;
                }),
                reduce((acc, current) => {
                    return this.minServer(acc, current);
                })
            ).subscribe(srv => server = srv);

            if (!server) {
                server = this.addNewServer();
            }
            asapScheduler.schedule(() => server.next(request));
        });
    }

    next(value: IncomingRequest) {
        this.requestEmitter.next(value);
    }

    error: (err: any) => void;

    complete() {
        this.sub.unsubscribe();
    }

    private minServer(first: Server, second: Server): Server {
        return first.load.cpuLoad < second.load.cpuLoad &&
            first.load.memoryLoad < second.load.memoryLoad ?
            first : second;
    }

    private addNewServer(): Server {
        let server = new Server(this.servers.length + 1);
        this.servers.push(server);
        document.body.appendChild(server.draw());
        return server;
    }
}

export { LoadBalancer }