import { Observable, Subscription, fromEvent, map } from "rxjs";
import { IncomingRequest } from "./IncomingRequest";
import { LoadBalancer } from "./LoadBalancer";
import { createView } from "./view";
import { MAX_CPU_LOAD, MAX_MEM_LOAD } from "./LoadRequirement";
import { generateRandom, createObservable } from "./utils";

let subscription: Subscription | null = null;
let cpuLoad: number = 0;
let memLoad: number = 0;
let maxCPULoad: number = MAX_CPU_LOAD;
let maxMEMLoad: number = MAX_MEM_LOAD;
let numRequests: number = 50;
let container = createView();
let [controls, parent] = Array.from(container.querySelectorAll("div"));
let startButton = controls.querySelector("button");
let [cpuLoadInput, memLoadInput, maxCpuLoad, maxMemLoad, slider] = Array.from(
  controls.querySelectorAll("input")
);
let loadBalancer: LoadBalancer = new LoadBalancer(parent);

const simulation$ = fromEvent(startButton, "click");
const numRequests$ = createObservable(slider, "input");
const cpuLoad$ = createObservable(cpuLoadInput, "input");
const memLoad$ = createObservable(memLoadInput, "input");
const maxCpuLoad$ = createObservable(maxCpuLoad, "input");
const maxMemLoad$ = createObservable(maxMemLoad, "input");

/* 
    recursive, infinite request stream
*/
const request$ = new Observable<IncomingRequest>((sub) => {
  let timeout: NodeJS.Timeout = null;

  (function push() {
    timeout = setTimeout(() => {
      let requestLoad = {
        cpuLoad: generateRandom(cpuLoad, maxCPULoad),
        memoryLoad: generateRandom(memLoad, maxMEMLoad),
      };
      sub.next(new IncomingRequest(Date.now().toString(), requestLoad));
      push();
    }, 50000 / numRequests);
  })();

  return () => clearTimeout(timeout);
});

document.body.appendChild(container);

simulation$.subscribe((_: Event) => {
  if (subscription) {
    subscription.unsubscribe();
  }
  subscription = request$.subscribe(loadBalancer);
});
numRequests$.subscribe((value) => {
  numRequests = value;
  console.log(numRequests);
});
cpuLoad$.subscribe((value) => {
  cpuLoad = value;
});
memLoad$.subscribe((value) => {
  memLoad = value;
});
maxCpuLoad$.subscribe((value) => {
  maxCPULoad = value < MAX_CPU_LOAD ? value : MAX_CPU_LOAD;
  maxCPULoad = maxCPULoad == 0 ? MAX_CPU_LOAD : maxCPULoad;
});
maxMemLoad$.subscribe((value) => {
  maxMEMLoad = value < MAX_MEM_LOAD ? value : MAX_MEM_LOAD;
  maxMEMLoad = maxMEMLoad == 0 ? MAX_MEM_LOAD : maxMEMLoad;
});
