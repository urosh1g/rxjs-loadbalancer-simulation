function generateRandom(min: number = 0, max: number = 100): number {
    let diff = max - min;
    let rand = Math.floor(Math.random() * diff) + min;
    return rand;
}

export { generateRandom }