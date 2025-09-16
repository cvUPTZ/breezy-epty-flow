import React, { useState, useEffect } from 'react';
import RepoVisualizer from '../components/visualizations/RepoVisualizer';

const VisualizationPage: React.FC = () => {
    const [graphData, setGraphData] = useState<any>(null);
    const [eventsData, setEventsData] = useState<any>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [graph, events, meta] = await Promise.all([
                    fetch('/data/graph.json').then(res => res.json()),
                    fetch('/data/events.json').then(res => res.json()),
                    fetch('/data/metadata.json').then(res => res.json()),
                ]);
                setGraphData(graph);
                setEventsData(events);
                setMetadata(meta);
            } catch (error) {
                console.error("Failed to fetch visualization data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading visualization data...</div>;
    }

    if (!graphData) {
        return <div>Could not load visualization data.</div>;
    }

    return (
        <div className="w-full h-screen">
            <RepoVisualizer
                graphData={graphData}
                eventsData={eventsData}
                metadata={metadata}
            />
        </div>
    );
};

export default VisualizationPage;
