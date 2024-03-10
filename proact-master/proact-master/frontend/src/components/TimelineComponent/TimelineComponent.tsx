import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Timeline } from 'vis-timeline';
import { DataSet } from 'vis-data';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import './TimelineComponent.css'
import { ActionInstance } from '../../redux/ActionQuery/actionquery.types';

interface TimeWindow {
    id: number;
    content: string;
    start: Date;
    end: Date;
    type: 'range';
    editable?: any;
    group?: number;
    className?: string;
}

type OcelTimeline = {
    start: string;
    end: string;
};

type TimelineComponentProps = {
    selectedActionInstance: ActionInstance | null;
    ocelTimeline: OcelTimeline | null;
    onPerformanceAnalysisWindowChange: (start: Date, end: Date) => void; // Add this line
};

const TimelineComponent: React.FC<TimelineComponentProps> = ({ selectedActionInstance, ocelTimeline, onPerformanceAnalysisWindowChange }) => {
    const container = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<Timeline | null>(null);

    const [eventLogWindowStart, setEventLogWindowStart] = useState<Date | null>(null);
    const [eventLogWindowEnd, setEventLogWindowEnd] = useState<Date | null>(null);
    const [actionWindowStart, setActionWindowStart] = useState<Date | null>(null);
    const [actionWindowEnd, setActionWindowEnd] = useState<Date | null>(null);
    const itemsRef = useRef<DataSet<TimeWindow>>(new DataSet<TimeWindow>([]));

    useEffect(() => {
        if (selectedActionInstance) {
            setActionWindowStart(new Date(selectedActionInstance.start));
            setActionWindowEnd(new Date(selectedActionInstance.end));
        }
    }, [selectedActionInstance]);

    useEffect(() => {
        if (ocelTimeline) {
            setEventLogWindowStart(new Date(ocelTimeline.start));
            setEventLogWindowEnd(new Date(ocelTimeline.end));
        }
    }, [ocelTimeline]);

    useEffect(() => {
        if (!container.current) return;

        const itemsData: TimeWindow[] = [];

        if (actionWindowStart && actionWindowEnd) {
            itemsData.push({
                id: 1,
                content: 'Action',
                start: actionWindowStart,
                end: actionWindowEnd,
                type: 'range',
                group: 1,
                className: 'first-window',
            });
        } else {
            const placeholderStart = new Date();
            const placeholderEnd = new Date(placeholderStart);
            placeholderEnd.setDate(placeholderStart.getDate() + 1); // Add 1 day to the start date
            itemsData.push({
                id: 1,
                content: 'Please select an action instance',
                start: placeholderStart,
                end: placeholderEnd,
                type: 'range',
                group: 1,
                className: 'placeholder-window',
            });
        }

        if (eventLogWindowStart && eventLogWindowEnd) {
            itemsData.push({
                id: 2,
                content: 'Event Log',
                start: eventLogWindowStart,
                end: eventLogWindowEnd,
                type: 'range',
                group: 2,
                className: 'second-window',
            });
        } else {
            const placeholderStart = new Date();
            const placeholderEnd = new Date(placeholderStart);
            placeholderEnd.setDate(placeholderStart.getDate() + 1); // Add 1 day to the start date
            itemsData.push({
                id: 2,
                content: 'Please select an event log',
                start: placeholderStart,
                end: placeholderEnd,
                type: 'range',
                group: 2,
                className: 'placeholder-window',
            });
        }

        if (actionWindowStart && actionWindowEnd && eventLogWindowStart && eventLogWindowEnd) {
            if (eventLogWindowStart >= actionWindowStart) {
                console.warn('The first time window should start before the second time window.');
            }

            const structuralOperationalAnalysisStart = eventLogWindowStart;
            const structuralOperationalAnalysisEnd = eventLogWindowEnd < actionWindowStart ? eventLogWindowEnd : actionWindowStart;

            itemsData.push({
                id: 3,
                content: 'Structural & Operational Analysis',
                start: structuralOperationalAnalysisStart,
                end: structuralOperationalAnalysisEnd,
                type: 'range',
                group: 3,
                className: 'structural-operational-analysis',
            });

            itemsData.push({
                id: 4,
                content: 'Performance Analysis',
                start: eventLogWindowStart, // Use the start time of the Event Log window
                end: actionWindowStart,       // Keep the end time of the Action window
                type: 'range',
                editable: { updateTime: true, updateGroup: false },
                group: 4,
                className: 'performance-analysis',
            });
        }

        itemsRef.current.clear();
        itemsRef.current.add(itemsData);

        const performanceAnalysisItem = itemsRef.current.get(4);
        if (performanceAnalysisItem) {
            console.log('Performance Analysis window updated', performanceAnalysisItem.start, performanceAnalysisItem.end);
            onPerformanceAnalysisWindowChange(performanceAnalysisItem.start, performanceAnalysisItem.end);
        }


        const groups = [
            { id: 1, content: '' },
            { id: 2, content: '' },
            { id: 3, content: '' },
            { id: 4, content: '' },
        ];

        const options = {
            stack: false,
            editable: true,
            orientation: 'top',
            verticalScroll: false,
            groupOrder: 'id',
            showCurrentTime: false,
            groupTemplate: function (group: any) {
                const container = document.createElement('div');
                return container;
            },
            template: function (item: any) {
                const container = document.createElement('div');
                container.innerText = item.content;
                container.style.color = 'white';
                return container;
            },
        };

        if (!timelineRef.current) {
            timelineRef.current = new Timeline(container.current, itemsRef.current, groups, options);
        } else {
            timelineRef.current.setItems(itemsRef.current);
        }


        return () => {
            timelineRef.current?.destroy();
            timelineRef.current = null;
        };
    }, [eventLogWindowStart, eventLogWindowEnd, actionWindowStart, actionWindowEnd]);

    useEffect(() => {
        const handleItemUpdated = (event: any, properties: any, senderId: any) => {
            if (properties.data[0]?.id === 4) {
                const performanceAnalysisItem = itemsRef.current.get(4);
                if (performanceAnalysisItem) {
                    console.log('Performance Analysis window updated', performanceAnalysisItem.start, performanceAnalysisItem.end);
                    onPerformanceAnalysisWindowChange(performanceAnalysisItem.start, performanceAnalysisItem.end);
                }
            }
        };

        itemsRef.current.on('update', handleItemUpdated);

        return () => {
            itemsRef.current.off('update', handleItemUpdated);
        };
    }, [onPerformanceAnalysisWindowChange]);


    return (
        <div ref={container} style={{ width: '100%', border: '1px solid lightgray' }} />
    );
};

export default TimelineComponent;
