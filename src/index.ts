import { Observable, fromEvent, map } from "rxjs";
import { IncomingRequest } from "./IncomingRequest";
import { LoadBalancer } from "./LoadBalancer";
import { createView } from "./view";

let cpuLoad: number = 0;
let memLoad: number = 0;

function generateRandom(min: number = 20, max: number = 100): number {
    let diff = max - min;
    let rand = Math.floor(Math.random() * diff) + min;
    return rand;
}

let container = createView();
console.log(container);
document.body.appendChild(container);

let [cpuLoadInput, memLoadInput] = Array.from(container.querySelectorAll("input"));

let cpuLoad$ = fromEvent(cpuLoadInput, "change").pipe(
    map(ev => (ev.target as HTMLInputElement).value),
    map(val => parseInt(val))
);

let memLoad$ = fromEvent(memLoadInput, "change").pipe(
    map(ev => (ev.target as HTMLInputElement).value),
    map(val => parseInt(val))
);

cpuLoad$.subscribe(value => {cpuLoad = value});
memLoad$.subscribe(value => {memLoad = value});

const stream$ = new Observable<IncomingRequest>(sub => {
    let timeout: NodeJS.Timeout = null;

    (function push(){
        timeout = setTimeout(() => {
            let requestLoad = {
                cpuLoad: generateRandom(cpuLoad, 100),
                memoryLoad: generateRandom(memLoad, 100),
            };
            sub.next(new IncomingRequest("name", requestLoad));
            push();
        }, 1000);
    })();
    return () => clearTimeout(timeout);
});

let loadBalancer: LoadBalancer = new LoadBalancer();
stream$.subscribe(loadBalancer);