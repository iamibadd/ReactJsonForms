import React, { useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';
import { ActionEngineResults, ActionInstance } from "../../redux/ActionQuery/actionquery.types";
import './ActionInstanceChart.css';

HighchartsGantt(Highcharts);

interface ActionInstanceChartProps {
    results: ActionEngineResults;
    onCellClick?: (data: ActionInstance) => void;
}

const ActionInstanceChart: React.FC<ActionInstanceChartProps> = ({ results, onCellClick }) => {
    const [selectedCell, setSelectedCell] = useState<string | null>(null);

    function processData(results: ActionEngineResults) {
        const data: { id: string; action: string; start: number; end: number; color: string }[] = [];
        results.results.forEach((result: ActionInstance, index: number) => {
            data.push({
                id: `${index}`,
                action: result.action,
                start: new Date(result.start).getTime(),
                end: new Date(result.end).getTime(),
                color: '#238C6E',
            });
        });
        return data;
    }

    const processedData = processData(results);

    const options: Highcharts.Options = {
        chart: {
            type: 'gantt',
            panning: {
                enabled: true,
                type: 'x'
            },
            panKey: 'shift' // Set the panKey to 'shift', 'alt', or 'ctrl'
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%e. %b',
                month: '%b \'%y',
                year: '%Y',
            },
            title: {
                text: '',
            },
            min: Math.min(...processedData.map((task) => task.start)),
            max: Math.max(...processedData.map((task) => task.end)),
        },
        yAxis: {
            type: 'category',
            categories: Array.from(new Set(processedData.map((d) => d.action))),
            min: 0,
            max: Array.from(new Set(processedData.map((d) => d.action))).length - 1,
        },
        tooltip: {
            xDateFormat: '%Y-%m-%d %H:%M'
        },
        series: processedData.map((task) => ({
            type: 'xrange',
            name: task.action,
            pointWidth: 20,
            data: [
                {
                    x: task.start,
                    x2: task.end,
                    y: Array.from(new Set(processedData.map((d) => d.action))).indexOf(task.action),
                    color: task.id === selectedCell ? '#2C3E50' : task.color, // Change the color when selected
                },
            ],
        })),
        rangeSelector: {
            enabled: true,
            selected: 3,
            buttons: [
                {
                    type: 'day',
                    count: 1,
                    text: '1d',
                },
                {
                    type: 'week',
                    count: 1,
                    text: '1w',
                },
                {
                    type: 'month',
                    count: 1,
                    text: '1m',
                },
                {
                    type: 'all',
                    text: 'All',
                },
            ],
        },
        plotOptions: {
            xrange: {
                pointPadding: 0,
                groupPadding: 0.5,
                point: {
                    events: {
                        click: function () {
                            const selectedData = processedData.find((data) => data.action === this.series.name);
                            if (selectedData) {
                                const actionInstance: ActionInstance = {
                                    action: selectedData.action,
                                    start: new Date(selectedData.start).toISOString(),
                                    end: new Date(selectedData.end).toISOString(),
                                };

                                if (onCellClick) {
                                    onCellClick(actionInstance);
                                }

                                // Update the selectedCell state
                                setSelectedCell(selectedData.id);
                            }
                        },

                    },
                },
            },
        },
        accessibility: {
            enabled: false
        },
        credits: {
            enabled: false,
        },
    };



    return (
        <div>
            <div className="ActionInstanceChart" >
                <HighchartsReact highcharts={Highcharts} options={options} constructorType={'ganttChart'} />
            </div >
        </div>

    );
};

export default ActionInstanceChart;
