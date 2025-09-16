document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');

    // --- DATA LOADING ---
    const graph = await (await fetch('data/graph.json')).json();
    const events = await (await fetch('data/events.json')).json();
    const metadata = await (await fetch('data/metadata.json')).json();

    console.log('Data loaded:', { graph, events, metadata });

    // --- SETUP ---
    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height);

    const container = svg.append('g');

    // --- ZOOM ---
    const zoom = d3.zoom().on('zoom', (event) => {
        container.attr('transform', event.transform);
    });
    svg.call(zoom);

    // --- SIMULATION ---
    const simulation = d3.forceSimulation(graph.nodes)
        .force('link', d3.forceLink(graph.edges).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

    // --- DRAWING ---
    const link = container.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.edges)
        .enter().append('line')
        .attr('class', 'link')
        .attr('stroke-width', 1.5);

    const node = container.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(graph.nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', 10)
        .attr('fill', d => getNodeColor(d.type))
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    node.append('title').text(d => d.name);

    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    });

    // --- HELPERS ---
    function getNodeColor(type) {
        switch (type) {
            case 'file': return '#1f77b4';
            case 'test_file': return '#aec7e8';
            case 'class': return '#ff7f0e';
            case 'function': return '#2ca02c';
            case 'test': return '#98df8a';
            default: return '#7f7f7f';
        }
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // --- UI INTERACTIONS ---
    const nodeDetailsPanel = document.getElementById('node-details');
    const detailsContent = document.getElementById('details-content');
    const sourceSnippetCode = document.querySelector('#source-snippet code');

    node.on('click', async (event, d) => {
        nodeDetailsPanel.style.display = 'block';
        detailsContent.textContent = JSON.stringify({
            id: d.id,
            name: d.name,
            type: d.type,
            path: d.path,
            lines: `${d.startLine}-${d.endLine}`,
            docstring: d.docstring,
            lastModified: d.lastModified,
        }, null, 2);

        // Fetch and display source snippet
        if (d.path) {
            try {
                // This path is now relative to the root of the repo, assuming a local server is running
                const response = await fetch(d.path);
                if (response.ok) {
                    const text = await response.text();
                    const lines = text.split('\n');
                    const snippet = lines.slice(d.startLine > 0 ? d.startLine - 1 : 0, d.endLine).join('\n');
                    sourceSnippetCode.textContent = snippet;
                } else {
                    sourceSnippetCode.textContent = `Could not load file: ${d.path}`;
                }
            } catch (error) {
                sourceSnippetCode.textContent = `Error loading file: ${error.message}`;
            }
        } else {
            sourceSnippetCode.textContent = 'No source path available for this node.';
        }
    });

    // Close details panel when clicking outside
    svg.on('click', (event) => {
        if (event.target.tagName.toLowerCase() !== 'circle') {
            nodeDetailsPanel.style.display = 'none';
        }
    });

    // Populate filter dropdown
    const filterType = document.getElementById('filter-type');
    const nodeTypes = [...new Set(graph.nodes.map(d => d.type))];
    nodeTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        filterType.appendChild(option);
    });

    // --- SEARCH & FILTER ---
    const searchInput = document.getElementById('search');
    const timeline = document.getElementById('timeline');

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = filterType.value;
        const timelineValue = timeline.value;
        const cutoffDate = new Date(events[timelineValue]?.timestamp || Date.now());

        const visibleNodes = new Set();
        graph.nodes.forEach(d => {
            const nameMatch = d.name.toLowerCase().includes(searchTerm);
            const typeMatch = selectedType ? d.type === selectedType : true;
            const timeMatch = new Date(d.lastModified) <= cutoffDate;
            if (nameMatch && typeMatch && timeMatch) {
                visibleNodes.add(d.id);
            }
        });

        node.style('display', d => visibleNodes.has(d.id) ? 'block' : 'none');

        link.style('display', d => {
            const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
            const targetId = typeof d.target === 'object' ? d.target.id : d.target;
            return visibleNodes.has(sourceId) && visibleNodes.has(targetId) ? 'block' : 'none';
        });
    }

    searchInput.addEventListener('input', applyFilters);
    filterType.addEventListener('change', applyFilters);

    // --- TIMELINE ---
    const timelineLabel = document.getElementById('timeline-label');

    if (events.length > 0) {
        timeline.max = events.length - 1;
        timeline.value = events.length - 1;

        timeline.addEventListener('input', () => {
            const event = events[timeline.value];
            if (event) {
                timelineLabel.textContent = new Date(event.timestamp).toLocaleDateString();
                applyFilters();
            }
        });
        // Set initial label
        timelineLabel.textContent = new Date(events[events.length - 1].timestamp).toLocaleDateString();

    } else {
        timeline.disabled = true;
        timelineLabel.textContent = "No events";
    }

    // --- EXPORT ---
    document.getElementById('export-json').addEventListener('click', () => {
        const data = node.data();
        const visibleNodesData = graph.nodes.filter((d, i) => {
            const nodeElement = node.nodes()[i];
            return nodeElement && nodeElement.style.display !== 'none';
        });
        const visibleNodeIds = new Set(visibleNodesData.map(d => d.id));
        const visibleEdgesData = graph.edges.filter(d => {
            const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
            const targetId = typeof d.target === 'object' ? d.target.id : d.target;
            return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
        });

        const dataStr = JSON.stringify({ nodes: visibleNodesData, edges: visibleEdgesData }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', 'graph.json');
        document.body.appendChild(exportLink);
        exportLink.click();
        document.body.removeChild(exportLink);
    });

    document.getElementById('export-svg').addEventListener('click', () => {
        const svgEl = svg.node();
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgEl);
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', url);
        exportLink.setAttribute('download', 'visualization.svg');
        document.body.appendChild(exportLink);
        exportLink.click();
        document.body.removeChild(exportLink);
    });

    // Initial filter application
    applyFilters();
});
