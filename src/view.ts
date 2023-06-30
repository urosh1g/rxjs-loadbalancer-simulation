function createView(): HTMLDivElement {
    let container = document.createElement("div");
    let cpuLoadInput = document.createElement("input");
    let memLoadInput = document.createElement("input");
    let numRequestsLabel = document.createElement("label");
    let numRequests = document.createElement("input");
    let servers = document.createElement("div");
    let startButton = document.createElement("button");

    startButton.innerText = "Start simulation";

    numRequestsLabel.innerText = "Number of requests";
    numRequests.type = "range";
    numRequests.min = "1";
    numRequests.max = "100";
    numRequests.value = "50";

    servers.style.display = "flex";
    servers.style.flexWrap = "wrap";
    servers.style.textAlign = "center";
    servers.style.justifyContent = "space-around";

    cpuLoadInput.classList.add("cpu-load");
    cpuLoadInput.type = "number";
    cpuLoadInput.placeholder = "Minimum CPU load for task";

    memLoadInput.classList.add("mem-load");
    memLoadInput.type = "number";
    memLoadInput.placeholder = "Minimum MEM load for task";

    container.appendChild(cpuLoadInput);
    container.appendChild(memLoadInput);
    container.appendChild(numRequestsLabel);
    container.appendChild(numRequests);
    container.appendChild(startButton);
    container.appendChild(servers);

    return container;
}

export { createView }