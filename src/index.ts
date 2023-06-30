import { Observable, fromEvent, map } from "rxjs";
import { IncomingRequest } from "./IncomingRequest";
import { LoadBalancer } from "./LoadBalancer";
import { createView } from "./view";
import { MAX_CPU_LOAD } from "./LoadRequirement";

function generateRandom(min: number = 0, max: number = MAX_CPU_LOAD): number {
    let diff = max - min;
    let rand = Math.floor(Math.random() * diff) + min;
    return rand;
}

let cpuLoad: number = 0;
let memLoad: number = 0;
let container = createView();
document.body.appendChild(container);
let parent = container.querySelector("div");
console.log(parent);
let [cpuLoadInput, memLoadInput] = Array.from(container.querySelectorAll("input"));
let loadBalancer: LoadBalancer = new LoadBalancer(parent);


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
    emits values every second
*/
const request$ = new Observable<IncomingRequest>(sub => {
    let timeout: NodeJS.Timeout = null;

    (function push() {
        timeout = setTimeout(() => {
            let requestLoad = {
                cpuLoad: generateRandom(cpuLoad, 100),
                memoryLoad: generateRandom(memLoad, 100),
            };
            sub.next(new IncomingRequest(Date.now().toString(), requestLoad));
            push();
        }, 2000);
    })();

    return () => clearTimeout(timeout);
});

cpuLoad$.subscribe(value => { cpuLoad = value });
memLoad$.subscribe(value => { memLoad = value });
request$.subscribe(loadBalancer);