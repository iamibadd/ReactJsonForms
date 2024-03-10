import { Stylesheet } from "cytoscape";

const preselectedColors = [
    '#E53935',
    '#1E88E5',
    '#7CB342',
    '#FF9800',
    '#5E35B1',
    '#FDD835',
    '#00897B',
    '#D81B60',
    '#795548'
]

function generateColors(numColors: number, colorIndex: number) {
    let h = colorIndex / numColors;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;

    let r, g, b;
    switch (i % 6) {
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
        default: r = 0; g = 0; b = 0; break; // to make typescript happy and avoid r,g,b "possibly" being undefined
    }

    return "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
}

// Either choose from preselected set of colors or generate an arbitrary amount of colors if not enough were preselected.
// Note that we cannot mix these two approaches and give back preselected colors until we don't have enough and then use
// the color generation as we currently can't make sure we don't generate a color that's identical (or too close) to a
// preselected (and already returned and therefore used) color.
export function getObjectTypeColor(numberOfColorsNeeded: number, indexOfCurrentColor: number) {
    console.assert(indexOfCurrentColor >= 0 && indexOfCurrentColor < numberOfColorsNeeded);

    if (numberOfColorsNeeded <= preselectedColors.length) {
        return preselectedColors[indexOfCurrentColor];
    } else {
        return generateColors(numberOfColorsNeeded, indexOfCurrentColor);
    }
}

export function secondsToHumanReadableFormat(seconds: number, accuracy: number = -1): string {
    function handleTimestep(remainingTime: number, factor: number, unit: string, parts: string[]): [number, string[]] {
        const count = Math.floor(remainingTime / factor)
        if (parts.length > 0 || count > 0)
            parts = parts.concat([`${count}${unit}`])
        return [remainingTime - count * factor, parts]
    }

    let parts: string[] = [];
    let remaining = seconds;
    [remaining, parts] = handleTimestep(remaining, 24 * 60 * 60, "d", parts);
    [remaining, parts] = handleTimestep(remaining, 60 * 60, "h", parts);
    [remaining, parts] = handleTimestep(remaining, 60, "m", parts);
    parts.push(`${Math.round(remaining)}s`);

    if (accuracy > 0 && accuracy < parts.length)
        parts = parts.slice(0, accuracy);

    return parts.reduce((a, b) => a + " " + b);
}

const calculateNodeSize = (label: string) => {
    const baseSize = 40;
    const extraSize = Math.max(0, label.length - 4) * 8;
    return baseSize + extraSize;
};

export const graphLanguageStyle: Stylesheet[] = [
    {
        selector: "node",
        style: {
            "background-image": "linear-gradient(to bottom, data(bgGradientTop), data(bgGradientBottom))",
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            "font-family": "Nunito, sans-serif",
            // "font-weight": "500",
            color: "#fff",
            "text-outline-color": "#000",
            "text-outline-width": "0.5px",
            "text-wrap": "wrap",
            "text-max-width": "100px",
            "border-color": "#888",
            "border-width": "1px",
            "border-opacity": 0.5,
            "overlay-padding": "4px",
        },
    },
    {
        selector: "node:selected",
        style: {
            "background-color": "#000000", // Change the background color of the selected node
            "border-color": "#000000", // Change the border color of the selected node
            "border-width": "5px", // Increase the border width of the selected node
        },
    },
    {
        selector: "node[type='activity']",
        style: {
            "background-color": "#F25E7A",  // node color
            "color": "#A60A33",  // node label color
            "shape": "round-rectangle",
            "label": "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            // width: (ele: any) => calculateNodeSize(ele.data("label")),
            // height: (ele: any) => calculateNodeSize(ele.data("label")),
            // height: 30, // Adjust this value as needed for the desired height
            "padding-left": ".5em"
        },
    },
    {
        selector: "node[type='object']",
        style: {
            "background-color": "#F25E7A",  // node color
            "color": "#A60A33",  // node label color
            "shape": "ellipse",
            "label": "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            // width: (ele: any) => calculateNodeSize(ele.data("label")),
            // height: (ele: any) => calculateNodeSize(ele.data("label")),
            "padding-left": ".5em"
        },
    },
    {
        selector: 'node[type = "hyperedge-node"]',
        style: {
            shape: 'polygon',
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            // width: (ele: any) => ele.data('width'),
            // height: 20,
            'background-color': '#ccc',
            "color": "#0D0D0D",  // node label color
            'border-width': 1,
            "font-size": "12px",
            "font-family": "Nunito, sans-serif",
        },
    },
    {
        selector: "node[type='constraint']",
        style: {
            "background-color": "#F27405",  // node color
            "color": "#0D0D0D",  // node label color
            "shape": "ellipse",
            "label": "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            "padding-left": ".5em"
        },
    },
    {
        selector: "node[type='relation']",
        style: {
            "background-color": "#D93D04",  // node color
            "color": "#0D0D0D",  // node label color
            "shape": "ellipse",
            "label": "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            "padding-left": ".5em"
        },
    },
    {
        selector: "node[type='constraint_pattern']",
        style: {
            "background-color": "#2BD999",  // node color
            "color": "#0D0D0D",  // node label color
            "shape": "ellipse",
            "label": "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            "padding-left": ".5em"
        },
    },
    {
        selector: "node[type='action']",
        style: {
            "background-color": "#238C6E",  // node color
            "color": "#0D0D0D",  // node label color
            "shape": "ellipse",
            "label": "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            "padding-left": ".5em"
        },
    },
    {
        selector: "edge",
        style: {
            "curve-style": "bezier",
            "line-color": "#F25E7A",
            "target-arrow-color": "#F25E7A",
            "target-arrow-shape": "triangle",
            "arrow-scale": 1,
            "line-style": "solid",
            width: "2px",
            label: "data(label)",
            "font-size": "12px",
            "font-family": "Nunito, sans-serif",
            color: "#A60A33",
        },
    },
    {
        selector: "edge:selected",
        style: {
            "line-color": "#333",
            "target-arrow-color": "#333",
            "text-border-color": "#333",
            "width": "4px", // Increase the width of the selected edge
        },
    },
    {
        selector: 'edge[type = "constraint"]',
        style: {
            label: (ele: any) => {
                return (
                    `Label: ${ele.data("edgeLabel")}\n` +
                    `Operator: ${ele.data("operation")}\n` +
                    `Threshold: ${ele.data("thresholdLabel")}`
                );
            },
            "text-wrap": "wrap",
            "text-valign": "center",
            "text-rotation": "autorotate",
            "text-margin-y": -30,
            'arrow-scale': 2,  // Arrow size
            'curve-style': 'bezier',
            "line-style": "solid",
            'color': '#A60A33',
        },
    },
    {
        selector: 'edge[type = "action"]',
        style: {
            "text-wrap": "wrap",
            "text-valign": "center",
            "text-rotation": "autorotate",
            "text-margin-y": -10,
            'arrow-scale': 2,  // Arrow size
            'curve-style': 'bezier',
            "line-style": "solid",
            'color': '#0D0D0D',
            "line-color": "#2BD999",
            "target-arrow-color": "#2BD999",
        },
    },
    {
        selector: 'edge[type = "conflict"]',
        style: {
            "text-wrap": "wrap",
            "text-valign": "center",
            "text-rotation": "autorotate",
            "text-margin-y": -10,
            'arrow-scale': 2,  // Arrow size
            'curve-style': 'bezier',
            "line-style": "solid",
            'color': '#0D0D0D',
            "line-color": "#238C6E",
            "target-arrow-color": "#238C6E",
        },
    },
    {
        selector: 'edge[type = "constraint-self-loop"]',
        style: {
            label: (ele: any) => {
                return (
                    `Label: ${ele.data("edgeLabel")}\n` +
                    `Operator: ${ele.data("operation")}\n` +
                    `Threshold: ${ele.data("thresholdLabel")}`
                );
            },
            'curve-style': 'unbundled-bezier',
            'loop-direction': '0deg',
            'loop-sweep': '90deg',
            'control-point-step-size': (ele) => {
                const sourceNode = ele.source();
                const nodeWidth = sourceNode.width();
                const nodeHeight = sourceNode.height();
                const nodeSize = Math.max(nodeWidth, nodeHeight);

                // Adjust the multiplier (e.g., 1.5) to change the loop size relative to the node size.
                return nodeSize * 1.1;
            },
            'control-point-distances': '0',
            'control-point-weights': '0.5',
            "text-wrap": "wrap",
            "text-valign": "center",
            "text-rotation": "autorotate",
            "text-margin-y": -30,
            'color': '#A60A33',
        },
    },
    {
        selector: 'edge[type = "constraint-hyperedge"]',
        style: {
            width: 1,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            "text-wrap": "wrap",
            "text-valign": "center",
            "text-rotation": "autorotate",
            "text-margin-y": -30,
            'curve-style': 'bezier',
            'color': 'black',
            'target-arrow-shape': 'none',
        },
    },
];
