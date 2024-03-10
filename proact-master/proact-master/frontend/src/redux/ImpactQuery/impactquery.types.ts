
export type StructuralImpact = {
    PriorSA: string[];
    PosteriorSA: string[];
    Metric: { [key: string]: number };
}

export type OperationalImpact = {
    PriorOIA: string[];
    PosteriorOIA: string[];
    Metric: { [key: string]: number };
}

export type PerformanceImpact = {
    Metric: { [key: string]: number };
}


export type ImpactAnalysisResult = {
    // StructuralImpact: StructuralImpact;
    // OperationalImpact: OperationalImpact;
    // PerformanceImpact: PerformanceImpact;
    results: { [key: string]: any };
}
