import { Observer, Subject, Subscription, asapScheduler, concatMap, filter, from, reduce } from "rxjs";
import { Server } from "./Server";
import { IncomingRequest } from "./IncomingRequest";
import { MAX_CPU_LOAD, MAX_MEM_LOAD } from "./LoadRequirement";

class LoadBalancer implements Observer<IncomingRequest> {
    private servers: Array<Server>;
    private requestEmitter: Subject<IncomingRequest>;
    private sub: Subscription;
    private nextId: number = 1;

    constructor() {
        this.servers = new Array<Server>(
            new Server(this.nextId++, this)
        );
        this.servers[this.servers.length - 1].draw(document.body);
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

    remove(server: Server) {
        let domElem = document.getElementById(`${server.id}`);
        if (domElem) domElem.remove();
        let serverToRemove = this.servers.find(srv => srv.id == server.id);
        if(serverToRemove) {
            let idx = this.servers.indexOf(serverToRemove);
            this.servers.splice(idx, 1);
        }
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
        let server = new Server(this.nextId++, this);
        this.servers.push(server);
        server.draw(document.body);
        return server;
    }
}

export { LoadBalancer }