export interface CommandResult {
    all: string;
}
export declare function runCommand(command: string, args: string[], options?: {
    stdio?: "inherit";
}): Promise<CommandResult>;
