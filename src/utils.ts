import { Observable, fromEvent, map } from "rxjs";
import { HasEventTargetAddRemove } from "rxjs/internal/observable/fromEvent";

function generateRandom(min: number = 0, max: number = 100): number {
  let diff = max - min;
  let rand = Math.floor(Math.random() * diff) + min;
  return rand;
}

function createObservable(
  target:
    | HasEventTargetAddRemove<Event>
    | ArrayLike<HasEventTargetAddRemove<Event>>,
  eventName: string
): Observable<number> {
  return fromEvent(target, eventName).pipe(
    map((ev) => (ev.target as HTMLInputElement).value),
    map((val) => parseInt(val))
  );
}

function setBackground(div: HTMLDivElement, load: number) {
  if (load < 33) {
    div.style.backgroundColor = "green";
  } else if (load < 66) {
    div.style.backgroundColor = "orange";
  } else {
    div.style.backgroundColor = "red";
  }
}

export { generateRandom, createObservable, setBackground };
