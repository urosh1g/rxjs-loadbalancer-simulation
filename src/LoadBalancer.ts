import { Observer, Subject, Subscription, asapScheduler, concatMap, filter, from, reduce } from "rxjs";
import { Server } from "./Server";
import { IncomingRequest } from "./IncomingRequest";
import { MAX_CPU_LOAD, MAX_MEM_LOAD } from "./LoadRequirement";

class LoadBalancer implements Observer<IncomingRequest> {
    private servers: Array<Server>;
    private requestEmitter: Subject<IncomingRequest>;
    private sub: Subscription;
    private nextId: number = 1;
    private parent: HTMLElement;

    constructor(parent?: HTMLElement) {
        if(parent) {
            this.parent = parent;
        }
        else {
            parent = document.body;
        }
        this.servers = new Array<Server>(
            new Server(this.nextId++, this)
        );
        this.servers[this.servers.length - 1].draw(parent);
        this.requestEmitter = new Subject();
        this.sub = this.requestEmitter.subscribe(request => {
            let server: Server; // server that's responsible for handling the request

            from(this.servers).pipe(
                filter((server) => {
                    return server.load.cpuLoad + request.loadRequirements.cpuLoad < MAX_CPU_LOAD &&
                        server.load.memoryLoad + request.loadRequirements.memoryLoad < MAX_MEM_LOAD;
                }),
                reduce((acc, current) => {
                    return this.minServer(acc, current);
                })
            ).subscribe(srv => server = srv);

            /*
                If no servers are able to handle the request,
                create a new instance and forward the request to it
            */
            if (!server) {
                server = this.addNewServer();
            }
            asapScheduler.schedule(() => server.next(request));
        });
    }

    /*
        Incoming Request, emit to a server
    */
    next(value: IncomingRequest) {
        this.requestEmitter.next(value);
    }
    error: (err: any) => void;
    complete() {
        this.sub.unsubscribe();
    }

    /*
        Remove provided server instance from the DOM
        and from the server list
    */
    remove(server: Server) {
        let domElem = document.getElementById(`${server.id}`);
        if (domElem) {
            domElem.classList.add("fadeOut");
            setTimeout(() => {domElem.remove(); }, 1000);
        }
        let serverToRemove = this.servers.find(srv => srv.id == server.id);
        if (serverToRemove) {
            let idx = this.servers.indexOf(serverToRemove);
            this.servers.splice(idx, 1);
        }
    }

    /*
        Return a server with minimal load
    */
    private minServer(first: Server, second: Server): Server {
        return first.load.cpuLoad < second.load.cpuLoad &&
            first.load.memoryLoad < second.load.memoryLoad ?
            first : second;
    }

    private addNewServer(): Server {
        let server = new Server(this.nextId++, this);
        this.servers.push(server);
        server.draw(this.parent);
        return server;
    }
}

export { LoadBalancer }
