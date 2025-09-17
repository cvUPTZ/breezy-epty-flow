import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface RepoVisualizerProps {
    graphData: any;
    eventsData: any;
    metadata: any;
}

const RepoVisualizer: React.FC<RepoVisualizerProps> = ({ graphData, eventsData, metadata }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [sourceSnippet, setSourceSnippet] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [timelineValue, setTimelineValue] = useState(eventsData.length - 1);

    useEffect(() => {
        if (!graphData || !svgRef.current) return;

        const svg = d3.select(svgRef.current)
            .attr('width', '100%')
            .attr('height', '100%');

        svg.selectAll("*").remove();

        const width = svg.node()?.getBoundingClientRect().width || 800;
        const height = svg.node()?.getBoundingClientRect().height || 600;

        const container = svg.append('g');

        const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
            container.attr('transform', event.transform);
        });
        svg.call(zoom);

        const simulation = d3.forceSimulation(graphData.nodes)
            .force('link', d3.forceLink(graphData.edges).id((d: any) => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = container.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(graphData.edges)
            .enter().append('line')
            .attr('class', 'link')
            .style('stroke', '#999')
            .style('stroke-opacity', 0.6)
            .style('stroke-width', 1.5);

        const node = container.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(graphData.nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', 10)
            .attr('fill', (d: any) => getNodeColor(d.type))
            .style('cursor', 'pointer')
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px')
            .call(d3.drag<any, any>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        node.append('title').text((d: any) => d.name);

        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            node
                .attr('cx', (d: any) => d.x)
                .attr('cy', (d: any) => d.y);
        });

        node.on('click', (event, d) => {
            setSelectedNode(d);
        });

        function applyFilters() {
            const cutoffDate = new Date(eventsData[timelineValue]?.timestamp || Date.now());

            const visibleNodes = new Set();
            graphData.nodes.forEach((d: any) => {
                const nameMatch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
                const typeMatch = filterType ? d.type === filterType : true;
                const timeMatch = new Date(d.lastModified) <= cutoffDate;
                if (nameMatch && typeMatch && timeMatch) {
                    visibleNodes.add(d.id);
                }
            });

            node.style('display', (d: any) => visibleNodes.has(d.id) ? 'block' : 'none');

            link.style('display', (d: any) => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                return visibleNodes.has(sourceId) && visibleNodes.has(targetId) ? 'block' : 'none';
            });
        }
        applyFilters();


        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

    }, [graphData, searchTerm, filterType, timelineValue]);

    useEffect(() => {
        if (selectedNode?.path) {
            fetch(selectedNode.path)
                .then(response => {
                    if (!response.ok) throw new Error('File not found');
                    return response.text();
                })
                .then(text => {
                    const lines = text.split('\n');
                    const snippet = lines.slice(
                        selectedNode.startLine > 0 ? selectedNode.startLine - 1 : 0,
                        selectedNode.endLine
                    ).join('\n');
                    setSourceSnippet(snippet);
                })
                .catch(error => {
                    setSourceSnippet(`Error loading file: ${error.message}`);
                });
        } else {
            setSourceSnippet('No source path available for this node.');
        }
    }, [selectedNode]);

    function getNodeColor(type: string) {
        switch (type) {
            case 'file': return '#1f77b4';
            case 'test_file': return '#aec7e8';
            case 'class': return '#ff7f0e';
            case 'function': return '#2ca02c';
            case 'test': return '#98df8a';
            default: return '#7f7f7f';
        }
    }

    const nodeTypes: string[] = [...new Set(graphData.nodes.map((d: any) => d.type))];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '5px' }}>
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search nodes..." />
                <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Node Types</option>
                    {nodeTypes.map(type => (
                        <option key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</option>
                    ))}
                </select>
            </div>

            <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>

            {selectedNode && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', border: '1px solid #ccc', padding: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <button onClick={() => setSelectedNode(null)} style={{ float: 'right' }}>Close</button>
                    <h3>Node Details</h3>
                    <pre>{JSON.stringify({
                        id: selectedNode.id,
                        name: selectedNode.name,
                        type: selectedNode.type,
                        path: selectedNode.path,
                        lines: `${selectedNode.startLine}-${selectedNode.endLine}`,
                        docstring: selectedNode.docstring,
                        lastModified: selectedNode.lastModified,
                    }, null, 2)}</pre>
                    <h4>Source Snippet</h4>
                    <div style={{ background: '#eee', padding: '5px', borderRadius: '3px', marginTop: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                        <pre><code className="language-typescript">{sourceSnippet}</code></pre>
                    </div>
                </div>
            )}

            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '80%', zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
                <label htmlFor="timeline">Event Timeline:</label>
                <input type="range" id="timeline" min="0" max={eventsData.length - 1} value={timelineValue} onChange={e => setTimelineValue(parseInt(e.target.value, 10))} style={{ width: '80%' }} />
                <span id="timeline-label">{new Date(eventsData[timelineValue]?.timestamp || Date.now()).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default RepoVisualizer;
