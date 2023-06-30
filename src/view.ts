function createView(): HTMLDivElement {
    let container = document.createElement("div");
    let cpuLoadInput = document.createElement("input");
    let memLoadInput = document.createElement("input");
    let servers = document.createElement("div");

    servers.style.display = "flex";
    servers.style.flexWrap = "wrap";
    servers.style.textAlign = "center";
    servers.style.justifyContent = "space-around";

    cpuLoadInput.classList.add("cpu-load");
    cpuLoadInput.type = "number";
    cpuLoadInput.placeholder = "Minimum CPU load for task";
    memLoadInput.classList.add("mem-load");
    memLoadInput.type = "number";
    memLoadInput.placeholder = "Minimum MEMORY load for task";

    container.appendChild(cpuLoadInput);
    container.appendChild(memLoadInput);
    container.appendChild(servers);

    return container;
}

export { createView }