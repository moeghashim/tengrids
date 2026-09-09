export type DocHeading = {
    heading: string;
    text: string;
    level: number;
    /** Storybook `toId(title, storyNameFromExport(name))`, set at docs-bundle time. */
    storyId?: string;
};

export type DocEntry = {
    id: string;
    title: string;
    path: string;
    headings: DocHeading[];
    text: string;
};

export type DocBundle = {
    version: string;
    docs: DocEntry[];
};

export type SearchHit = {
    id: string;
    heading: string;
    score: number;
    excerpt: string;
};
