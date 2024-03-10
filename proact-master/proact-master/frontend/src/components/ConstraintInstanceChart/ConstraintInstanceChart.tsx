import React from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';
import { MonitoringResults, MonitoringResult } from '../../redux/MonitoringQuery/monitoringquery.types';
import './ConstraintInstanceChart.css';

HighchartsGantt(Highcharts);

interface ConstraintInstanceChartProps {
    results: MonitoringResults;
}

const ConstraintInstanceChart: React.FC<ConstraintInstanceChartProps> = ({ results }) => {

    function processData(results: MonitoringResults) {
        const data: { id: string; name: string; start: number; end: number; color: string }[] = [];
        Object.keys(results.results).forEach((key) => {
            results.results[key].forEach((result: MonitoringResult) => {
                data.push({
                    id: `${key}`,
                    name: key,
                    start: new Date(result.start).getTime(),
                    end: new Date(result.end).getTime(),
                    color: result.occured ? '#A60A33' : '#eae2b7',
                });
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
            categories: Array.from(new Set(processedData.map((d) => d.name))),
            min: 0,
            max: Array.from(new Set(processedData.map((d) => d.name))).length - 1,
        },
        tooltip: {
            xDateFormat: '%Y-%m-%d %H:%M'
        },
        series: processedData.map((task) => ({
            type: 'xrange',
            name: task.name,
            pointWidth: 20,
            data: [
                {
                    x: task.start,
                    x2: task.end,
                    y: Array.from(new Set(processedData.map((d) => d.name))).indexOf(task.name),
                    color: task.color,
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
        <div className="ConstraintInstanceChart">
            <HighchartsReact highcharts={Highcharts} options={options} constructorType={'ganttChart'} />
        </div>
    );
};

export default ConstraintInstanceChart;
