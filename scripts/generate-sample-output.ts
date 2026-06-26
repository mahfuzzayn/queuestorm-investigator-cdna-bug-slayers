import { orchestrator } from "../src/lib/orchestrator";
import sampleCases from "../data/QueueStorm_Preli_Sample_Cases.json";
import fs from "fs";
import path from "path";

async function main() {
  const firstCase = sampleCases[0];
  const response = await orchestrator(firstCase as any);

  const outputPath = path.resolve(
    __dirname,
    "..",
    "public-sample-output",
    "sample-output.json",
  );
  fs.writeFileSync(outputPath, JSON.stringify(response, null, 2));
  console.log("Sample output written to", outputPath);
}

main().catch(console.error);
