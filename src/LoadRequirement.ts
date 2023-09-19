interface LoadRequirement {
  cpuLoad: number;
  memoryLoad: number;
}

const MAX_CPU_LOAD: number = 100;
const MAX_MEM_LOAD: number = 100;

export { LoadRequirement, MAX_CPU_LOAD, MAX_MEM_LOAD };
