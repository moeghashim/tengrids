export type DocHeading = {
    heading: string;
    text: string;
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
