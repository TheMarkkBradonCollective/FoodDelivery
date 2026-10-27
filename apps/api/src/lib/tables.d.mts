export declare const TABLES: Record<string, string[]>;
export declare const JSON_COLUMNS: Set<string>;
export declare const KEYS: Record<string, string[]>;
export declare function keyOf(table: string): string[];
export declare function tabPrefix(): string;
export declare function tabName(table: string): string;
export declare function rangeOf(table: string, a1: string): string;
