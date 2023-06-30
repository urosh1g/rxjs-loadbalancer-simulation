import { Observable, Subscription, fromEvent, map } from "rxjs";
import { IncomingRequest } from "./IncomingRequest";
import { LoadBalancer } from "./LoadBalancer";
import { createView } from "./view";
import { MAX_CPU_LOAD, MAX_MEM_LOAD } from "./LoadRequirement";
import { generateRandom } from "./utils";


let subscription: Subscription | null = null;
let cpuLoad: number = 0;
let memLoad: number = 0;
let numRequests: number = 50;
let container = createView();
let parent = container.querySelector("div");
let startButton = container.querySelector("button");
let [cpuLoadInput, memLoadInput, slider] = Array.from(container.querySelectorAll("input"));
let loadBalancer: LoadBalancer = new LoadBalancer(parent);

const simulation$ = fromEvent(startButton, "click");

const numRequests$ = fromEvent(slider, "input").pipe(
    map(ev => (ev.target as HTMLInputElement).value),
    map(val => parseInt(val))
);

const cpuLoad$ = fromEvent(cpuLoadInput, "change").pipe(
    map(ev => (ev.target as HTMLInputElement).value),
    map(val => parseInt(val))
);

const memLoad$ = fromEvent(memLoadInput, "change").pipe(
    map(ev => (ev.target as HTMLInputElement).value),
    map(val => parseInt(val))
);

/* 
    recursive, infinite request stream
*/
const request$ = new Observable<IncomingRequest>(sub => {
    let timeout: NodeJS.Timeout = null;

    (function push() {
        timeout = setTimeout(() => {
            let requestLoad = {
                cpuLoad: generateRandom(cpuLoad, MAX_CPU_LOAD),
                memoryLoad: generateRandom(memLoad, MAX_MEM_LOAD),
            };
            sub.next(new IncomingRequest(Date.now().toString(), requestLoad));
            push();
        }, 50000 / numRequests);
    })();

    return () => clearTimeout(timeout);
});

document.body.appendChild(container);

simulation$.subscribe((ev: Event) => {
    if(subscription) {
        subscription.unsubscribe();
    }
    subscription = request$.subscribe(loadBalancer);
});
numRequests$.subscribe(value => { numRequests = value; console.log(numRequests)});
cpuLoad$.subscribe(value => { cpuLoad = value });
memLoad$.subscribe(value => { memLoad = value });