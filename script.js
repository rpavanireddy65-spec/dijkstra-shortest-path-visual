/*
    DIJKSTRA'S ALGORITHM
    Single Source Shortest Path
    Greedy Method

    This project supports:

    1. Undirected connected graphs
    2. Directed graphs
    3. Disconnected graphs
    4. Weighted graphs
    5. Graphs containing multiple possible paths

    IMPORTANT:
    Dijkstra works only with NON-NEGATIVE edge weights.
*/


// ============================================================
// GRAPH DATA
// ============================================================

const graphPresets = {

    // Simple connected graph
    simple: {
        directed: false,

        nodes: ["A", "B", "C", "D", "E", "F"],

        edges: [
            ["A", "B", 4],
            ["A", "C", 2],
            ["B", "C", 1],
            ["B", "D", 5],
            ["C", "D", 8],
            ["C", "E", 10],
            ["D", "E", 2],
            ["D", "F", 6],
            ["E", "F", 3]
        ]
    },


    // Directed graph
    directed: {
        directed: true,

        nodes: ["A", "B", "C", "D", "E", "F"],

        edges: [
            ["A", "B", 4],
            ["A", "C", 2],
            ["B", "D", 3],
            ["C", "B", 1],
            ["C", "D", 7],
            ["C", "E", 4],
            ["D", "F", 2],
            ["E", "F", 1]
        ]
    },


    // Disconnected graph
    disconnected: {
        directed: false,

        nodes: ["A", "B", "C", "D", "E", "F", "G"],

        edges: [
            ["A", "B", 4],
            ["A", "C", 2],
            ["B", "D", 5],
            ["C", "D", 8],
            ["E", "F", 3],
            ["F", "G", 2]
        ]
    },


    // Multiple paths
    multiple: {
        directed: false,

        nodes: ["A", "B", "C", "D", "E", "F"],

        edges: [
            ["A", "B", 7],
            ["A", "C", 9],
            ["A", "F", 14],
            ["B", "C", 10],
            ["B", "D", 15],
            ["C", "D", 11],
            ["C", "F", 2],
            ["D", "E", 6],
            ["D", "F", 9],
            ["E", "F", 9]
        ]
    },


    // Weighted graph
    weighted: {
        directed: false,

        nodes: ["A", "B", "C", "D", "E", "F", "G"],

        edges: [
            ["A", "B", 12],
            ["A", "C", 5],
            ["A", "D", 8],
            ["B", "D", 3],
            ["B", "E", 7],
            ["C", "D", 2],
            ["C", "F", 6],
            ["D", "E", 4],
            ["D", "F", 9],
            ["E", "G", 5],
            ["F", "G", 3]
        ]
    }

};


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let currentGraph = null;

let adjacencyList = {};

let distances = {};

let previous = {};

let visited = {};

let algorithmFinished = false;

let currentVertex = null;

let stepNumber = 0;


// ============================================================
// DOM ELEMENTS
// ============================================================

const graphPreset =
    document.getElementById("graphPreset");

const sourceVertex =
    document.getElementById("sourceVertex");

const loadGraphBtn =
    document.getElementById("loadGraphBtn");

const runBtn =
    document.getElementById("runBtn");

const stepBtn =
    document.getElementById("stepBtn");

const resetBtn =
    document.getElementById("resetBtn");

const graphSvg =
    document.getElementById("graphSvg");

const status =
    document.getElementById("status");

const stepExplanation =
    document.getElementById("stepExplanation");

const distanceTable =
    document.getElementById("distanceTable");

const shortestPaths =
    document.getElementById("shortestPaths");


// ============================================================
// INITIALIZATION
// ============================================================

loadGraph();


graphPreset.addEventListener(
    "change",
    loadGraph
);


loadGraphBtn.addEventListener(
    "click",
    loadGraph
);


runBtn.addEventListener(
    "click",
    runDijkstra
);


stepBtn.addEventListener(
    "click",
    performStep
);


resetBtn.addEventListener(
    "click",
    resetAlgorithm
);


// ============================================================
// LOAD GRAPH
// ============================================================

function loadGraph() {

    const selected =
        graphPreset.value;

    currentGraph =
        JSON.parse(
            JSON.stringify(
                graphPresets[selected]
            )
        );

    buildAdjacencyList();

    populateSourceVertices();

    resetAlgorithm();

    drawGraph();
}


// ============================================================
// BUILD ADJACENCY LIST
// ============================================================

function buildAdjacencyList() {

    adjacencyList = {};

    currentGraph.nodes.forEach(
        node => {
            adjacencyList[node] = [];
        }
    );


    currentGraph.edges.forEach(
        edge => {

            const [from, to, weight] = edge;

            adjacencyList[from].push({
                node: to,
                weight: weight
            });


            // For undirected graph
            if (!currentGraph.directed) {

                adjacencyList[to].push({
                    node: from,
                    weight: weight
                });

            }

        }
    );
}


// ============================================================
// POPULATE SOURCE DROPDOWN
// ============================================================

function populateSourceVertices() {

    sourceVertex.innerHTML = "";

    currentGraph.nodes.forEach(
        node => {

            const option =
                document.createElement("option");

            option.value = node;

            option.textContent =
                `Vertex ${node}`;

            sourceVertex.appendChild(option);

        }
    );
}


// ============================================================
// RESET ALGORITHM
// ============================================================

function resetAlgorithm() {

    distances = {};

    previous = {};

    visited = {};

    algorithmFinished = false;

    currentVertex = null;

    stepNumber = 0;


    currentGraph.nodes.forEach(
        node => {

            distances[node] =
                Infinity;

            previous[node] =
                null;

            visited[node] =
                false;

        }
    );


    const source =
        sourceVertex.value;

    if (source) {

        distances[source] = 0;

    }


    updateTable();

    updateStatus();

    clearPathHighlight();

    drawGraph();


    shortestPaths.innerHTML =
        "Run the algorithm to display shortest paths.";
}


// ============================================================
// FIND MINIMUM DISTANCE VERTEX
// ============================================================

function getMinimumDistanceVertex() {

    let minDistance =
        Infinity;

    let minVertex =
        null;


    currentGraph.nodes.forEach(
        node => {

            if (
                !visited[node] &&
                distances[node] < minDistance
            ) {

                minDistance =
                    distances[node];

                minVertex =
                    node;

            }

        }
    );


    return minVertex;
}


// ============================================================
// PERFORM ONE DIJKSTRA STEP
// ============================================================

function performStep() {

    if (algorithmFinished) {

        return;

    }


    const source =
        sourceVertex.value;


    // Select vertex with smallest tentative distance
    const u =
        getMinimumDistanceVertex();


    // No reachable vertices left
    if (u === null) {

        algorithmFinished = true;

        currentVertex = null;

        stepExplanation.textContent =
            "There are no more reachable unvisited vertices. " +
            "The algorithm has finished.";

        status.textContent =
            "Algorithm completed.";

        drawGraph();

        showShortestPaths();

        return;
    }


    currentVertex = u;

    stepNumber++;


    // Mark current vertex visited
    visited[u] = true;


    // Relax neighboring edges
    let relaxations = [];


    adjacencyList[u].forEach(
        edge => {

            const v =
                edge.node;

            const weight =
                edge.weight;


            if (!visited[v]) {

                const newDistance =
                    distances[u] + weight;


                if (
                    newDistance <
                    distances[v]
                ) {

                    distances[v] =
                        newDistance;

                    previous[v] =
                        u;


                    relaxations.push(
                        `${u} → ${v}: ` +
                        `${newDistance}`
                    );

                }

            }

        }
    );


    // Explanation
    if (relaxations.length > 0) {

        stepExplanation.innerHTML =
            `<strong>Step ${stepNumber}:</strong>
             Selected <strong>${u}</strong>
             because it has the smallest tentative
             distance (${distances[u]}).
             <br><br>
             Relaxed edges:
             <strong>${relaxations.join(", ")}</strong>.`;

    } else {

        stepExplanation.innerHTML =
            `<strong>Step ${stepNumber}:</strong>
             Selected <strong>${u}</strong>
             because it has the smallest tentative
             distance (${distances[u]}).
             No distance needed updating.`;

    }


    status.textContent =
        `Greedy choice: vertex ${u} is now permanently visited.`;


    updateTable();

    drawGraph();


    // Check if complete
    const remaining =
        currentGraph.nodes.some(
            node =>
                !visited[node] &&
                distances[node] !== Infinity
        );


    if (!remaining) {

        algorithmFinished = true;

        setTimeout(
            () => {

                status.textContent =
                    "✓ Dijkstra's algorithm completed successfully.";

                showShortestPaths();

                highlightAllShortestPaths();

            },
            300
        );

    }
}


// ============================================================
// RUN DIJKSTRA AUTOMATICALLY
// ============================================================

function runDijkstra() {

    resetAlgorithm();


    let interval =
        setInterval(
            () => {

                if (algorithmFinished) {

                    clearInterval(interval);

                    return;

                }

                performStep();

            },
            900
        );

}


// ============================================================
// UPDATE TABLE
// ============================================================

function updateTable() {

    distanceTable.innerHTML = "";


    currentGraph.nodes.forEach(
        node => {

            const row =
                document.createElement("tr");


            const distance =
                distances[node] === Infinity
                    ? "∞"
                    : distances[node];


            const previousVertex =
                previous[node] === null
                    ? "-"
                    : previous[node];


            const state =
                visited[node]
                    ? "Visited"
                    : "Unvisited";


            row.innerHTML = `

                <td>
                    <strong>${node}</strong>
                </td>

                <td class="
                    ${distances[node] === Infinity
                        ? "infinity"
                        : ""}
                ">
                    ${distance}
                </td>

                <td>
                    ${previousVertex}
                </td>

                <td class="
                    ${visited[node]
                        ? "visited-text"
                        : "unvisited-text"}
                ">
                    ${state}
                </td>
            `;


            distanceTable.appendChild(row);

        }
    );
}


// ============================================================
// UPDATE STATUS
// ============================================================

function updateStatus() {

    const source =
        sourceVertex.value;


    status.innerHTML =
        `Source vertex:
        <strong>${source}</strong>.
        Initial distance is 0 and all other
        distances are infinity.`;

    stepExplanation.textContent =
        "Dijkstra is ready. Click Run Dijkstra or Step.";
}


// ============================================================
// DRAW GRAPH
// ============================================================

function drawGraph() {

    graphSvg.innerHTML = "";


    const width =
        graphSvg.clientWidth || 800;

    const height =
        graphSvg.clientHeight || 550;


    /*
        Positions are generated around a circle.
        This makes the project work with different
        graph sizes without requiring an external library.
    */

    const centerX =
        width / 2;

    const centerY =
        height / 2;


    const radius =
        Math.min(width, height) * 0.34;


    const positions = {};


    currentGraph.nodes.forEach(
        (node, index) => {

            const angle =
                (2 * Math.PI * index) /
                currentGraph.nodes.length;

            positions[node] = {

                x:
                    centerX +
                    radius *
                    Math.cos(angle),

                y:
                    centerY +
                    radius *
                    Math.sin(angle)

            };

        }
    );


    // Arrow marker for directed graphs
    if (currentGraph.directed) {

        const defs =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "defs"
            );


        const marker =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "marker"
            );


        marker.setAttribute(
            "id",
            "arrow"
        );

        marker.setAttribute(
            "markerWidth",
            "10"
        );

        marker.setAttribute(
            "markerHeight",
            "10"
        );

        marker.setAttribute(
            "refX",
            "9"
        );

        marker.setAttribute(
            "refY",
            "3"
        );

        marker.setAttribute(
            "orient",
            "auto"
        );


        const path =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );


        path.setAttribute(
            "d",
            "M0,0 L0,6 L9,3 z"
        );

        path.setAttribute(
            "fill",
            "#94a3b8"
        );


        marker.appendChild(path);

        defs.appendChild(marker);

        graphSvg.appendChild(defs);

    }


    // Draw edges
    currentGraph.edges.forEach(
        (edge, index) => {

            const [from, to, weight] =
                edge;


            const p1 =
                positions[from];

            const p2 =
                positions[to];


            const line =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );


            line.setAttribute(
                "x1",
                p1.x
            );

            line.setAttribute(
                "y1",
                p1.y
            );

            line.setAttribute(
                "x2",
                p2.x
            );

            line.setAttribute(
                "y2",
                p2.y
            );


            line.classList.add(
                "edge"
            );


            if (
                isEdgeInShortestPath(
                    from,
                    to
                )
            ) {

                line.classList.add(
                    "active"
                );

            }


            if (currentGraph.directed) {

                line.setAttribute(
                    "marker-end",
                    "url(#arrow)"
                );

            }


            graphSvg.appendChild(line);


            // Edge weight
            const text =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );


            text.setAttribute(
                "x",
                (p1.x + p2.x) / 2
            );

            text.setAttribute(
                "y",
                (p1.y + p2.y) / 2 - 8
            );


            text.classList.add(
                "edge-label"
            );


            text.textContent =
                weight;


            graphSvg.appendChild(text);

        }
    );


    // Draw nodes
    currentGraph.nodes.forEach(
        node => {

            const p =
                positions[node];


            const circle =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                );


            circle.setAttribute(
                "cx",
                p.x
            );

            circle.setAttribute(
                "cy",
                p.y
            );

            circle.setAttribute(
                "r",
                "28"
            );


            circle.classList.add(
                "node"
            );


            if (
                node === sourceVertex.value
            ) {

                circle.classList.add(
                    "source"
                );

            }


            if (visited[node]) {

                circle.classList.add(
                    "visited"
                );

            }


            if (
                node === currentVertex
            ) {

                circle.classList.add(
                    "current"
                );

            }


            graphSvg.appendChild(circle);


            // Node label
            const text =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );


            text.setAttribute(
                "x",
                p.x
            );

            text.setAttribute(
                "y",
                p.y
            );


            text.classList.add(
                "node-label"
            );


            text.textContent =
                node;


            graphSvg.appendChild(text);

        }
    );

}


// ============================================================
// CHECK SHORTEST PATH EDGE
// ============================================================

function isEdgeInShortestPath(
    from,
    to
) {

    return (
        isPathConnection(from, to) ||
        isPathConnection(to, from)
    );

}


// ============================================================
// CHECK PATH CONNECTION
// ============================================================

function isPathConnection(
    from,
    to
) {

    let current =
        to;


    while (
        current !== null &&
        previous[current] !== null
    ) {

        if (
            previous[current] === from
        ) {

            return true;

        }


        current =
            previous[current];

    }


    return false;
}


// ============================================================
// SHOW SHORTEST PATHS
// ============================================================

function showShortestPaths() {

    shortestPaths.innerHTML = "";


    const source =
        sourceVertex.value;


    currentGraph.nodes.forEach(
        destination => {

            if (
                destination === source
            ) {

                return;

            }


            const card =
                document.createElement("div");


            card.className =
                "path-card";


            const path =
                getShortestPath(
                    source,
                    destination
                );


            if (
                distances[destination] ===
                Infinity
            ) {

                card.innerHTML = `

                    <h3>
                        ${source} → ${destination}
                    </h3>

                    <p class="unreachable">
                        No path exists.
                    </p>
                `;

            } else {

                card.innerHTML = `

                    <h3>
                        ${source} → ${destination}
                    </h3>

                    <p class="path-line">
                        Path:
                        <strong>
                            ${path.join(" → ")}
                        </strong>
                    </p>

                    <p class="distance">
                        Distance:
                        ${distances[destination]}
                    </p>
                `;

            }


            shortestPaths.appendChild(
                card
            );

        }
    );
}


// ============================================================
// GET SHORTEST PATH
// ============================================================

function getShortestPath(
    source,
    destination
) {

    const path = [];

    let current =
        destination;


    while (current !== null) {

        path.unshift(current);

        current =
            previous[current];

    }


    if (
        path[0] !== source
    ) {

        return [];

    }


    return path;
}


// ============================================================
// HIGHLIGHT ALL SHORTEST PATHS
// ============================================================

function highlightAllShortestPaths() {

    drawGraph();

}


// ============================================================
// CLEAR PATH
// ============================================================

function clearPathHighlight() {

    currentVertex = null;

}


// ============================================================
// HANDLE SOURCE CHANGE
// ============================================================

sourceVertex.addEventListener(
    "change",
    () => {

        resetAlgorithm();

    }
);


// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        drawGraph();

    }
);