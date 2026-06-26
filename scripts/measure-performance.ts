import { orchestrator } from "../src/lib/orchestrator";
import sampleCases from "../data/QueueStorm_Preli_Sample_Cases.json";

async function measureLatency() {
  const latencies: number[] = [];

  for (let round = 0; round < 3; round++) {
    for (const sample of sampleCases) {
      const start = performance.now();
      await orchestrator(sample as any);
      const end = performance.now();
      latencies.push(end - start);
    }
  }

  latencies.sort((a, b) => a - b);
  const n = latencies.length;
  const p95 = latencies[Math.floor(n * 0.95)];
  const p99 = latencies[Math.floor(n * 0.99)];
  const max = latencies[n - 1];
  const min = latencies[0];
  const avg =
    latencies.reduce((s, v) => s + v, 0) / latencies.length;

  console.log("--- Performance Report ---");
  console.log(`Samples: ${latencies.length} runs`);
  console.log(`Min:     ${min.toFixed(2)}ms`);
  console.log(`Avg:     ${avg.toFixed(2)}ms`);
  console.log(`p95:     ${p95.toFixed(2)}ms`);
  console.log(`p99:     ${p99.toFixed(2)}ms`);
  console.log(`Max:     ${max.toFixed(2)}ms`);
  console.log(`Target:  ≤5000ms (p95)`);
  console.log(`Pass:    ${p95 <= 5000 ? "YES" : "NO"}`);
}

measureLatency().catch(console.error);
