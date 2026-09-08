import { styled } from "@linaria/react";

export const RailRoot = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    font-family: var(--gdg-font-family, Inter, system-ui, sans-serif);
    color: var(--gdg-text-dark, #313139);
    background: var(--gdg-bg-cell, #ffffff);
`;

export const ChipCluster = styled.div`
    display: inline-flex;
    align-items: stretch;
    max-width: 320px;
    border: 1px solid var(--gdg-border-color, rgba(115, 116, 131, 0.16));
    border-radius: var(--gdg-rounding-radius, 4px);
    background: var(--gdg-bg-header, #f7f7f8);
    color: var(--gdg-text-dark, #313139);
    overflow: hidden;

    &[data-active="true"] {
        background: var(--gdg-accent-color, #4f5dff);
        color: var(--gdg-accent-fg, #ffffff);
        border-color: var(--gdg-accent-color, #4f5dff);
    }
`;

export const Chip = styled.button`
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 280px;
    padding: 4px 10px;
    border: none;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.3;
    cursor: pointer;
    text-align: left;

    &:focus {
        outline: 2px solid var(--gdg-accent-color, #4f5dff);
        outline-offset: -2px;
    }
`;

export const ChipLabel = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ChipClear = styled.button`
    appearance: none;
    border: none;
    border-left: 1px solid currentColor;
    background: transparent;
    color: inherit;
    cursor: pointer;
    padding: 4px 8px;
    margin: 0;
    font-size: 14px;
    line-height: 1;
    opacity: 0.85;

    &:hover {
        opacity: 1;
    }

    &:focus {
        outline: 2px solid var(--gdg-accent-color, #4f5dff);
        outline-offset: -2px;
    }
`;

export const ClearAll = styled.button`
    appearance: none;
    border: none;
    background: transparent;
    color: var(--gdg-text-medium, #737383);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    padding: 4px 6px;
    text-decoration: underline;

    &:focus {
        outline: 2px solid var(--gdg-accent-color, #4f5dff);
        outline-offset: 1px;
    }
`;

export const TruncatedNote = styled.span`
    color: var(--gdg-text-medium, #737383);
    font-size: 12px;
`;

export const Popover = styled.div`
    box-sizing: border-box;
    min-width: 220px;
    max-width: 320px;
    max-height: 360px;
    overflow: auto;
    padding: 10px;
    background: var(--gdg-bg-cell, #ffffff);
    color: var(--gdg-text-dark, #313139);
    border: 1px solid var(--gdg-border-color, rgba(115, 116, 131, 0.16));
    border-radius: var(--gdg-rounding-radius, 4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    font-family: var(--gdg-font-family, Inter, system-ui, sans-serif);
    font-size: 13px;
    z-index: 10000;
`;

export const FieldList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const OptionRow = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: var(--gdg-text-dark, #313139);

    input {
        margin: 0;
    }
`;

export const Count = styled.span`
    margin-left: auto;
    color: var(--gdg-text-medium, #737383);
    font-size: 12px;
`;

export const ControlInput = styled.input`
    box-sizing: border-box;
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--gdg-border-color, rgba(115, 116, 131, 0.16));
    border-radius: var(--gdg-rounding-radius, 4px);
    background: var(--gdg-bg-cell, #ffffff);
    color: var(--gdg-text-dark, #313139);
    font-family: inherit;
    font-size: 13px;

    &:focus {
        outline: 2px solid var(--gdg-accent-color, #4f5dff);
        outline-offset: 1px;
    }
`;

export const ControlSelect = styled.select`
    box-sizing: border-box;
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--gdg-border-color, rgba(115, 116, 131, 0.16));
    border-radius: var(--gdg-rounding-radius, 4px);
    background: var(--gdg-bg-cell, #ffffff);
    color: var(--gdg-text-dark, #313139);
    font-family: inherit;
    font-size: 13px;
`;

export const ControlLabel = styled.label`
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: var(--gdg-text-medium, #737383);
    font-size: 12px;
`;
