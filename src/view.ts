function createView(): HTMLDivElement {
    let container = document.createElement("div");
    let controlsContainer = document.createElement("div");
    let cpuLoadInput = document.createElement("input");
    let memLoadInput = document.createElement("input");
    let maxCpuLoadInput = document.createElement("input");
    let maxMemLoadInput = document.createElement("input");
    let numRequestsLabel = document.createElement("label");
    let numRequests = document.createElement("input");
    let servers = document.createElement("div");
    let startButton = document.createElement("button");

    controlsContainer.style.display = "flex";
    controlsContainer.style.flexDirection = "column";

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

    maxCpuLoadInput.classList.add("cpu-load");
    maxCpuLoadInput.type = "number";
    maxCpuLoadInput.placeholder = "Maximum CPU load for task";

    memLoadInput.classList.add("mem-load");
    memLoadInput.type = "number";
    memLoadInput.placeholder = "Minimum MEM load for task";

    maxMemLoadInput.classList.add("mem-load");
    maxMemLoadInput.type = "number";
    maxMemLoadInput.placeholder = "Maximum MEM load for task";

    controlsContainer.appendChild(cpuLoadInput);
    controlsContainer.appendChild(memLoadInput);
    controlsContainer.appendChild(maxCpuLoadInput);
    controlsContainer.appendChild(maxMemLoadInput);
    controlsContainer.appendChild(numRequestsLabel);
    controlsContainer.appendChild(numRequests);
    controlsContainer.appendChild(startButton);
    container.appendChild(controlsContainer);
    container.appendChild(servers);

    return container;
}

export { createView }