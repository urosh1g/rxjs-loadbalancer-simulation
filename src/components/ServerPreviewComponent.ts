import { BarComponent } from "./BarComponent";

class ServerPreviewComponent {
  container: HTMLDivElement;
  textElement: HTMLParagraphElement;
  barContainer: HTMLDivElement;
  cpuBar: BarComponent;
  memBar: BarComponent;

  private serverId: number;

  constructor(serverId: number) {
    this.container = document.createElement("div");
    this.textElement = document.createElement("p");
    this.barContainer = document.createElement("div");
    this.cpuBar = new BarComponent("CPU");
    this.memBar = new BarComponent("MEM");
    this.serverId = serverId;
  }

  draw(parent: HTMLElement) {
    this.container.classList.add("flex-column-container");
    this.container.id = `${this.serverId}`;
    this.barContainer.classList.add("server-bars");
    this.textElement.innerText = `Server ${this.serverId}`;

    this.cpuBar.draw(this.barContainer);
    this.memBar.draw(this.barContainer);

    this.container.appendChild(this.textElement);
    this.container.appendChild(this.barContainer);

    parent.appendChild(this.container);
  }
}

export { ServerPreviewComponent };
