
export type MonitoringResult = {
    start: string;
    end: string;
    occured: boolean;
}


export type MonitoringResults = {
    results: { [key: string]: MonitoringResult[] }
}
