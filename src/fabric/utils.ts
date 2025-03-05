function stringIntoDecimalNum(x: string) { 
    return parseInt(x, 10); 
};

export function isVersionNewerThan(version1: string, version2: string): boolean {
    const ver1 = version1.split(".").map(stringIntoDecimalNum);
    const ver2 = version2.split(".").map(stringIntoDecimalNum);
    for (let i = 0; i < ver1.length && i < ver2.length; i++) {
        if (ver1[i] > ver2[i]) {
            return true;
        }
        if (ver1[i] < ver2[i]) {
            return false;
        }
    }
    return false;
}