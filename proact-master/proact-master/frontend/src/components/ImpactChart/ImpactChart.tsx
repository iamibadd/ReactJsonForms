import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { ImpactAnalysisResult } from "../../redux/ImpactQuery/impactquery.types";

interface ImpactChartProps {
    impactQueryState: { [key: string]: any };
    kind: string;
}

const ImpactChart: React.FC<ImpactChartProps> = ({ impactQueryState, kind }) => {
    const [impactChartDisplay, setImpactChartDisplay] = useState<React.ReactNode | null>(null);

    const generateFSAChartOptions = (data: { [key: string]: any }) => {
        const categories = Object.keys(data);
        const series = [];

        const processTypes = new Set<string>();

        for (const category of categories) {
            for (const processType in data[category]) {
                processTypes.add(processType);
            }
        }

        for (const processType of processTypes) {
            const seriesData = categories.map((category) => data[category][processType] || 0);
            series.push({ name: processType, data: seriesData });
        }

        return {
            chart: {
                type: "bar",
            },
            title: {
                text: "",
            },
            xAxis: {
                categories,
            },
            yAxis: {
                title: {
                    text: "Count",
                },
            },
            series,
            credits: {
                enabled: false,
            },
        };
    };

    const generateOSAChartOptions = (data: { [key: string]: number }) => {
        const categories = Object.keys(data);

        const seriesData = categories.map((category) => data[category] || 0);

        return {
            chart: {
                type: "bar",
            },
            title: {
                text: "",
            },
            xAxis: {
                categories,
            },
            yAxis: {
                title: {
                    text: "Count",
                },
            },
            series: [
                {
                    name: "",
                    data: seriesData,
                },
            ],
            credits: {
                enabled: false,
            },

        };
    };

    const generateOIAChartOptions = (
        category: 'Prior' | 'Posterior',
        data: { [key: string]: any }
    ) => {
        const processTypes = Object.keys(data[category]);
        const allActivities: { [key: string]: { [key: string]: number } } = {};

        for (const processType of processTypes) {
            for (const activity in data[category][processType]) {
                if (!allActivities[activity]) {
                    allActivities[activity] = {};
                }
                allActivities[activity][processType] = data[category][processType][activity];
            }
        }

        const series = processTypes.map((processType) => {
            const seriesData = Object.keys(allActivities).map((activity) => {
                return allActivities[activity][processType] || 0;
            });

            return {
                name: processType,
                data: seriesData,
            };
        });

        return {
            chart: {
                type: 'bar',
            },
            title: {
                text: "",
            },
            xAxis: {
                categories: Object.keys(allActivities),
            },
            yAxis: {
                title: {
                    text: 'Count',
                },
            },
            series,
            credits: {
                enabled: false,
            },

        };
    };


    const generateFPAChartOptions = (
        activity: string,
        data: { [key: string]: any }
    ) => {
        const categories = [
            'flow',
            'sojourn',
            'syncronization',
            'pooling',
            'lagging',
            'readiness',
        ];
        const processTypes = new Set<string>();

        for (const category of categories) {
            for (const processType in data[activity][category]) {
                processTypes.add(processType);
            }
        }

        const series: { name: string; data: number[] }[] = [];

        for (const category of categories) {
            if (
                category === 'pooling' ||
                category === 'lagging' ||
                category === 'readiness'
            ) {
                if (data[activity][category]) {  // Ensuring that data[activity][category] is not undefined
                    for (const processType of processTypes) {
                        if (data[activity][category].hasOwnProperty(processType)) {
                            const value = data[activity][category][processType];
                            if (value !== null && value !== undefined) {
                                const seriesName = `${category} - ${processType}`;
                                const seriesData = categories.map((cat) => (cat === category ? value : 0));
                                series.push({ name: seriesName, data: seriesData });
                            }
                        }
                    }
                }
            }
            else {
                const value = data[activity][category];
                if (value !== null && value !== undefined) {
                    const seriesName = `${category}`;
                    const seriesData = categories.map((cat) => (cat === category ? value : 0));
                    series.push({ name: seriesName, data: seriesData });
                }
            }
        }

        return {
            chart: {
                type: 'bar',
            },
            title: {
                text: `${activity}`,
            },
            xAxis: {
                categories,
            },
            yAxis: {
                title: {
                    text: 'Value',
                },
                labels: {
                    formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
                        const seconds = this.value as number;
                        const days = Math.floor(seconds / 86400);
                        const hours = Math.floor((seconds % 86400) / 3600);
                        const minutes = Math.floor(((seconds % 86400) % 3600) / 60);
                        const remainingSeconds = seconds % 60;

                        const format = (n: number) => String(n).padStart(2, '0');
                        const formattedTime = `${days}d ${format(hours)}h ${format(minutes)}m ${format(remainingSeconds)}s`;
                        return formattedTime;
                    },
                },
            },

            series,
            credits: {
                enabled: false,
            },

        };
    };

    const generateOPAChartOptions = (
        activity: string,
        data: { [key: string]: any }
    ) => {
        const categories = [
            "elapsed",
            "remaining",
            "object_freq",
        ];

        const processTypes: string[] = [];


        for (const processType in data[activity]) {
            processTypes.push(processType);
        }


        const series = processTypes.map((processType) => {
            const seriesData = categories.map((category) => {
                const value = data[activity][processType][category];
                return value !== null && value !== undefined ? value : 0;
            });

            return {
                name: processType,
                data: seriesData,
            };
        });

        return {
            chart: {
                type: "bar",
            },
            title: {
                text: `${activity}`,
            },
            xAxis: {
                categories,
            },
            yAxis: {
                title: {
                    text: 'Value',
                },
                labels: {
                    formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
                        const seconds = this.value as number;
                        const days = Math.floor(seconds / 86400);
                        const hours = Math.floor((seconds % 86400) / 3600);
                        const minutes = Math.floor(((seconds % 86400) % 3600) / 60);
                        const remainingSeconds = seconds % 60;

                        const format = (n: number) => String(n).padStart(2, '0');
                        const formattedTime = `${days}d ${format(hours)}h ${format(minutes)}m ${format(remainingSeconds)}s`;
                        return formattedTime;
                    },
                },
            },
            series,
            credits: {
                enabled: false,
            },

        };
    };


    const renderFPACharts = (data: { [key: string]: any }) => {
        const activities = Object.keys(data);
        return activities.map((activity) => {
            const chartOptions = generateFPAChartOptions(activity, data);
            return (
                <div key={activity}>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </div>
            );
        });
    };

    const renderOPACharts = (data: { [key: string]: any }) => {
        const activities = Object.keys(data);
        return activities.map((activity) => {
            const chartOptions = generateOPAChartOptions(activity, data);
            return (
                <div key={activity}>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </div>
            );
        });
    };



    useEffect(() => {
        let chartOptions = null;
        if (kind === "FSA") {
            chartOptions = generateFSAChartOptions(impactQueryState);
            setImpactChartDisplay(
                <div>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </div>
            );
        } else if (kind === "OSA") {
            chartOptions = generateOSAChartOptions(impactQueryState);
            setImpactChartDisplay(
                <div>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </div>
            );
        } else if (kind === "OIA-Prior") {
            chartOptions = generateOIAChartOptions("Prior", impactQueryState);
            setImpactChartDisplay(
                <div>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </div>
            );
        } else if (kind === "OIA-Posterior") {
            chartOptions = generateOIAChartOptions("Posterior", impactQueryState);
            setImpactChartDisplay(
                <div>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </div>
            );
        } else if (kind === "FPA") {
            setImpactChartDisplay(renderFPACharts(impactQueryState));
        } else if (kind === "OPA") {
            setImpactChartDisplay(renderOPACharts(impactQueryState));
        }
    }, [impactQueryState, kind]);

    return (
        <div>
            {impactChartDisplay}
        </div>
    );
}

export default ImpactChart;
