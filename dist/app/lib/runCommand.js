"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const child_process_1 = require("child_process");
function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(command, args, {
            stdio: options.stdio === "inherit" ? "inherit" : ["ignore", "pipe", "pipe"],
        });
        let stdout = "";
        let stderr = "";
        child.stdout?.setEncoding("utf8").on("data", chunk => { stdout += chunk; });
        child.stderr?.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
        child.once("error", reject);
        child.once("close", code => {
            if (code === 0)
                resolve({ all: stdout + stderr });
            else
                reject(new Error(`${command} ${args.join(" ")} exited with code ${code}: ${stderr}`));
        });
    });
}
//# sourceMappingURL=runCommand.js.map