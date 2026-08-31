"use strict";
// --- Step 1: Describe the shape of each endpoint's response ---
Object.defineProperty(exports, "__esModule", { value: true });
// --- Step 3: A generic fetch helper with explicit error checking ---
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${url}`);
    }
    return (await response.json());
}
// --- Step 4: Query multiple endpoints in parallel, fault-tolerantly ---
async function runSystemMonitor() {
    const endpoints = [
        { name: "Posts API", url: "https://jsonplaceholder.typicode.com/posts/1" },
        { name: "Todos API", url: "https://jsonplaceholder.typicode.com/todos/1" },
        { name: "Broken Endpoint", url: "https://jsonplaceholder.typicode.com/this-does-not-exist" },
    ];
    const results = await Promise.allSettled(endpoints.map((e) => fetchJson(e.url)));
    const reports = results.map((result, index) => {
        const endpointName = endpoints[index].name;
        if (result.status === "fulfilled") {
            return {
                endpoint: endpointName,
                status: "OK",
                detail: `title: "${result.value.title}"`,
            };
        }
        else {
            return {
                endpoint: endpointName,
                status: "FAILED",
                detail: result.reason.message,
            };
        }
    });
    return reports;
}
// --- Step 5: Run it and print a clean summary ---
runSystemMonitor().then((reports) => {
    console.log("=== System Monitor Report ===");
    for (const report of reports) {
        const icon = report.status === "OK" ? "✅" : "❌";
        console.log(`${icon} ${report.endpoint}: ${report.status} — ${report.detail}`);
    }
});
