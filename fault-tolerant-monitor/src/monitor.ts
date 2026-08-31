// --- Step 1: Describe the shape of each endpoint's response ---

interface Post {
  id: number;
  title: string;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// --- Step 2: A single, unified shape our app will report in ---

interface EndpointReport {
  endpoint: string;
  status: "OK" | "FAILED";
  detail: string;
}

// --- Step 3: A generic fetch helper with explicit error checking ---

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return (await response.json()) as T;
}

// --- Step 4: Query multiple endpoints in parallel, fault-tolerantly ---

async function runSystemMonitor(): Promise<EndpointReport[]> {
  const endpoints = [
    { name: "Posts API", url: "https://jsonplaceholder.typicode.com/posts/1" },
    { name: "Todos API", url: "https://jsonplaceholder.typicode.com/todos/1" },
    { name: "Broken Endpoint", url: "https://jsonplaceholder.typicode.com/this-does-not-exist" },
  ];

  const results = await Promise.allSettled(
    endpoints.map((e) => fetchJson<Post | Todo>(e.url))
  );

  const reports: EndpointReport[] = results.map((result, index) => {
    const endpointName = endpoints[index].name;

    if (result.status === "fulfilled") {
      return {
        endpoint: endpointName,
        status: "OK",
        detail: `title: "${result.value.title}"`,
      };
    } else {
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