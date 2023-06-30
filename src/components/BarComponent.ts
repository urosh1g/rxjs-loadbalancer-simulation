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
            this.textElement.innerText = this.barName;
            this.barContainer.appendChild(this.textElement);
            this.barContainer.appendChild(this.barContent);
            this.container.appendChild(this.barContainer);
        }
        parent.appendChild(this.container);
    }
}

export { BarComponent }