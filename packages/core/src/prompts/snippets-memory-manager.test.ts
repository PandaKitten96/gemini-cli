/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { renderOperationalGuidelines } from './snippets.js';

describe('renderOperationalGuidelines - memoryManagerEnabled', () => {
  const baseOptions = {
    interactive: true,
    interactiveShellEnabled: false,
    topicUpdateNarration: false,
    memoryManagerEnabled: false,
  };

  it('should include standard memory tool guidance when memoryManagerEnabled is false', () => {
    const result = renderOperationalGuidelines(baseOptions);
    expect(result).toContain('save_memory');
    expect(result).toContain('persist facts across sessions');
    expect(result).not.toContain('Memory Files');
  });

  it('should teach direct GEMINI.md editing when memoryManagerEnabled is true', () => {
    const result = renderOperationalGuidelines({
      ...baseOptions,
      memoryManagerEnabled: true,
    });
    expect(result).toContain('Memory Files');
    expect(result).toContain('GEMINI.md');
    expect(result).toContain('./GEMINI.md');
    expect(result).toContain('There is no `save_memory` tool');
    expect(result).not.toContain('subagent');
    // The Global memory tier is intentionally not surfaced in this mode:
    // the prompt no longer routes facts to ~/.gemini/GEMINI.md.
    expect(result).not.toContain('~/.gemini/GEMINI.md');
  });

  it('should NOT include the User Project bullet when userProjectMemoryPath is undefined', () => {
    const result = renderOperationalGuidelines({
      ...baseOptions,
      memoryManagerEnabled: true,
    });
    expect(result).not.toContain('**User Project**');
  });

  it('should include the User Project bullet with the absolute path when provided', () => {
    const userProjectMemoryPath =
      '/Users/test/.gemini/tmp/abc123/memory/GEMINI.md';
    const result = renderOperationalGuidelines({
      ...baseOptions,
      memoryManagerEnabled: true,
      userProjectMemoryPath,
    });
    expect(result).toContain('**User Project**');
    expect(result).toContain(userProjectMemoryPath);
    expect(result).toContain('NOT** be committed to the repo');
  });
});
