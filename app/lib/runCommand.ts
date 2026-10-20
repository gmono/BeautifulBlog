import { spawn } from "child_process";

export interface CommandResult {
  all: string;
}

export function runCommand(command: string, args: string[], options: { stdio?: "inherit" } = {}): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio === "inherit" ? "inherit" : ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.setEncoding("utf8").on("data", chunk => { stdout += chunk; });
    child.stderr?.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", code => {
      if (code === 0) resolve({ all: stdout + stderr });
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}: ${stderr}`));
    });
  });
}
