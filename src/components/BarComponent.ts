class BarComponent {
  container: HTMLDivElement;
  textElement: HTMLParagraphElement;
  barContainer: HTMLDivElement;
  barOutline: HTMLDivElement;
  barContent: HTMLDivElement;

  private configured: boolean = false;
  private barName: string;

  constructor(barName: string) {
    this.container = document.createElement("div");
    this.textElement = document.createElement("p");
    this.barContainer = document.createElement("div");
    this.barOutline = document.createElement("div");
    this.barContent = document.createElement("div");
    this.barName = barName;
  }

  draw(parent: HTMLElement) {
    if (!this.configured) {
      this.barContent.classList.add("bar");
      this.barContainer.classList.add("bar-container");
      this.barOutline.classList.add("bar-outline");
      this.textElement.innerText = this.barName;
      this.barOutline.appendChild(this.barContent);
      this.barContainer.appendChild(this.textElement);
      this.barContainer.appendChild(this.barOutline);
      this.container.appendChild(this.barContainer);
    }
    parent.appendChild(this.container);
  }
}

export { BarComponent };
