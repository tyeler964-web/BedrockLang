export interface Diagnostic {
    severity: "error" | "warning" | "info";
    message: string;
}