/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect } from 'vitest';
import {
  evalTest,
  assertModelHasOutput,
  checkModelOutputContent,
} from './test-helper.js';

describe('save_memory', () => {
  const TEST_PREFIX = 'Save memory test: ';
  const rememberingFavoriteColor = "Agent remembers user's favorite color";
  evalTest('ALWAYS_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: rememberingFavoriteColor,

    prompt: `remember that my favorite color is  blue.
  
    what is my favorite color? tell me that and surround it with $ symbol`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall('save_memory');
      expect(wasToolCalled, 'Expected save_memory tool to be called').toBe(
        true,
      );

      assertModelHasOutput(result);
      checkModelOutputContent(result, {
        expectedContent: 'blue',
        testName: `${TEST_PREFIX}${rememberingFavoriteColor}`,
      });
    },
  });
  const rememberingCommandRestrictions = 'Agent remembers command restrictions';
  evalTest('USUALLY_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: rememberingCommandRestrictions,

    prompt: `I don't want you to ever run npm commands.`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall('save_memory');
      expect(wasToolCalled, 'Expected save_memory tool to be called').toBe(
        true,
      );

      assertModelHasOutput(result);
      checkModelOutputContent(result, {
        expectedContent: [/not run npm commands|remember|ok/i],
        testName: `${TEST_PREFIX}${rememberingCommandRestrictions}`,
      });
    },
  });

  const rememberingWorkflow = 'Agent remembers workflow preferences';
  evalTest('USUALLY_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: rememberingWorkflow,

    prompt: `I want you to always lint after building.`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall('save_memory');
      expect(wasToolCalled, 'Expected save_memory tool to be called').toBe(
        true,
      );

      assertModelHasOutput(result);
      checkModelOutputContent(result, {
        expectedContent: [/always|ok|remember|will do/i],
        testName: `${TEST_PREFIX}${rememberingWorkflow}`,
      });
    },
  });

  const ignoringTemporaryInformation =
    'Agent ignores temporary conversation details';
  evalTest('ALWAYS_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: ignoringTemporaryInformation,

    prompt: `I'm going to get a coffee.`,
    assert: async (rig, result) => {
      await rig.waitForTelemetryReady();
      const wasToolCalled = rig
        .readToolLogs()
        .some((log) => log.toolRequest.name === 'save_memory');
      expect(
        wasToolCalled,
        'save_memory should not be called for temporary information',
      ).toBe(false);

      assertModelHasOutput(result);
      checkModelOutputContent(result, {
        testName: `${TEST_PREFIX}${ignoringTemporaryInformation}`,
        forbiddenContent: [/remember|will do/i],
      });
    },
  });

  const rememberingPetName = "Agent remembers user's pet's name";
  evalTest('ALWAYS_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: rememberingPetName,

    prompt: `Please remember that my dog's name is Buddy.`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall('save_memory');
      expect(wasToolCalled, 'Expected save_memory tool to be called').toBe(
        true,
      );

      assertModelHasOutput(result);
      checkModelOutputContent(result, {
        expectedContent: [/Buddy/i],
        testName: `${TEST_PREFIX}${rememberingPetName}`,
      });
    },
  });

  const rememberingCommandAlias = 'Agent remembers custom command aliases';
  evalTest('ALWAYS_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: rememberingCommandAlias,

    prompt: `When I say 'start server', you should run 'npm run dev'.`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall('save_memory');
      expect(wasToolCalled, 'Expected save_memory tool to be called').toBe(
        true,
      );

      assertModelHasOutput(result);
      checkModelOutputContent(result, {
        expectedContent: [/npm run dev|start server|ok|remember|will do/i],
        testName: `${TEST_PREFIX}${rememberingCommandAlias}`,
      });
    },
  });

  const savingDbSchemaLocationAsProjectMemory =
    'Agent saves workspace database schema location as project memory';
  evalTest('USUALLY_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: savingDbSchemaLocationAsProjectMemory,
    prompt: `The database schema for this workspace is located in \`db/schema.sql\`.`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall(
        'save_memory',
        undefined,
        (args) => {
          try {
            const params = JSON.parse(args);
            return params.scope === 'project';
          } catch {
            return false;
          }
        },
      );
      expect(
        wasToolCalled,
        'Expected save_memory to be called with scope="project" for workspace-specific information',
      ).toBe(true);

      assertModelHasOutput(result);
    },
  });

  const rememberingCodingStyle =
    "Agent remembers user's coding style preference";
  evalTest('ALWAYS_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: rememberingCodingStyle,

    prompt: `I prefer to use tabs instead of spaces for indentation.`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall('save_memory');
      expect(wasToolCalled, 'Expected save_memory tool to be called').toBe(
        true,
      );

      assertModelHasOutput(result);
      checkModelOutputContent(result, {
        expectedContent: [/tabs instead of spaces|ok|remember|will do/i],
        testName: `${TEST_PREFIX}${rememberingCodingStyle}`,
      });
    },
  });

  const savingBuildArtifactLocationAsProjectMemory =
    'Agent saves workspace build artifact location as project memory';
  evalTest('USUALLY_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: savingBuildArtifactLocationAsProjectMemory,
    prompt: `In this workspace, build artifacts are stored in the \`dist/artifacts\` directory.`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall(
        'save_memory',
        undefined,
        (args) => {
          try {
            const params = JSON.parse(args);
            return params.scope === 'project';
          } catch {
            return false;
          }
        },
      );
      expect(
        wasToolCalled,
        'Expected save_memory to be called with scope="project" for workspace-specific information',
      ).toBe(true);

      assertModelHasOutput(result);
    },
  });

  const savingMainEntryPointAsProjectMemory =
    'Agent saves workspace main entry point as project memory';
  evalTest('USUALLY_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: savingMainEntryPointAsProjectMemory,
    prompt: `The main entry point for this workspace is \`src/index.js\`.`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall(
        'save_memory',
        undefined,
        (args) => {
          try {
            const params = JSON.parse(args);
            return params.scope === 'project';
          } catch {
            return false;
          }
        },
      );
      expect(
        wasToolCalled,
        'Expected save_memory to be called with scope="project" for workspace-specific information',
      ).toBe(true);

      assertModelHasOutput(result);
    },
  });

  const rememberingBirthday = "Agent remembers user's birthday";
  evalTest('ALWAYS_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: rememberingBirthday,

    prompt: `My birthday is on June 15th.`,
    assert: async (rig, result) => {
      const wasToolCalled = await rig.waitForToolCall('save_memory');
      expect(wasToolCalled, 'Expected save_memory tool to be called').toBe(
        true,
      );

      assertModelHasOutput(result);
      checkModelOutputContent(result, {
        expectedContent: [/June 15th|ok|remember|will do/i],
        testName: `${TEST_PREFIX}${rememberingBirthday}`,
      });
    },
  });

  const proactiveMemoryFromLongSession =
    'Agent saves preference from earlier in conversation history';
  evalTest('USUALLY_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: proactiveMemoryFromLongSession,
    params: {
      settings: {
        experimental: { memoryManager: true },
      },
    },
    messages: [
      {
        id: 'msg-1',
        type: 'user',
        content: [
          {
            text: 'By the way, I always prefer Vitest over Jest for testing in all my projects.',
          },
        ],
        timestamp: '2026-01-01T00:00:00Z',
      },
      {
        id: 'msg-2',
        type: 'gemini',
        content: [{ text: 'Noted! What are you working on today?' }],
        timestamp: '2026-01-01T00:00:05Z',
      },
      {
        id: 'msg-3',
        type: 'user',
        content: [
          {
            text: "I'm debugging a failing API endpoint. The /users route returns a 500 error.",
          },
        ],
        timestamp: '2026-01-01T00:01:00Z',
      },
      {
        id: 'msg-4',
        type: 'gemini',
        content: [
          {
            text: 'It looks like the database connection might not be initialized before the query runs.',
          },
        ],
        timestamp: '2026-01-01T00:01:10Z',
      },
      {
        id: 'msg-5',
        type: 'user',
        content: [
          { text: 'Good catch — I fixed the import and the route works now.' },
        ],
        timestamp: '2026-01-01T00:02:00Z',
      },
      {
        id: 'msg-6',
        type: 'gemini',
        content: [{ text: 'Great! Anything else you would like to work on?' }],
        timestamp: '2026-01-01T00:02:05Z',
      },
    ],
    prompt:
      'Please save any persistent preferences or facts about me from our conversation to memory.',
    assert: async (rig, result) => {
      // Under experimental.memoryManager, the agent persists memories by
      // editing GEMINI.md files directly with write_file or replace — not via
      // a save_memory subagent. The Global tier is not surfaced in this mode,
      // so the Vitest preference must land in either the project-root
      // GEMINI.md or the per-project User Project memory file
      // (~/.gemini/tmp/<hash>/memory/GEMINI.md), and must NOT touch the
      // global ~/.gemini/GEMINI.md.
      await rig.waitForToolCall('write_file').catch(() => {});
      const writeCalls = rig
        .readToolLogs()
        .filter((log) =>
          ['write_file', 'replace'].includes(log.toolRequest.name),
        );
      const wroteVitestToAllowedTier = writeCalls.some((log) => {
        const args = log.toolRequest.args;
        if (!/vitest/i.test(args)) return false;
        const wroteToProjectRoot =
          /GEMINI\.md/i.test(args) && !/\.gemini\//i.test(args);
        const wroteToUserProject =
          /\.gemini\/tmp\/[^/]+\/memory\/GEMINI\.md/i.test(args);
        return wroteToProjectRoot || wroteToUserProject;
      });
      expect(
        wroteVitestToAllowedTier,
        'Expected the agent to write the Vitest preference to either a project-root GEMINI.md or the user-project memory file (~/.gemini/tmp/<hash>/memory/GEMINI.md) via write_file or replace',
      ).toBe(true);

      const leakedToGlobal = writeCalls.some((log) => {
        const args = log.toolRequest.args;
        return (
          /\.gemini\/GEMINI\.md/i.test(args) &&
          !/tmp\/[^/]+\/memory/i.test(args) &&
          /vitest/i.test(args)
        );
      });
      expect(
        leakedToGlobal,
        'Vitest preference must NOT be written to the global ~/.gemini/GEMINI.md',
      ).toBe(false);

      assertModelHasOutput(result);
    },
  });

  const memoryManagerRoutingPreferences =
    'Agent routes project-scoped preferences to project memory';
  evalTest('USUALLY_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: memoryManagerRoutingPreferences,
    params: {
      settings: {
        experimental: { memoryManager: true },
      },
    },
    messages: [
      {
        id: 'msg-1',
        type: 'user',
        content: [
          {
            text: 'For this project, the team always runs tests with `npm run test` — please remember that as our project convention.',
          },
        ],
        timestamp: '2026-01-01T00:00:00Z',
      },
      {
        id: 'msg-2',
        type: 'gemini',
        content: [
          { text: 'Got it, I will keep `npm run test` in mind for tests.' },
        ],
        timestamp: '2026-01-01T00:00:05Z',
      },
      {
        id: 'msg-3',
        type: 'user',
        content: [
          {
            text: 'For this project specifically, we use 2-space indentation.',
          },
        ],
        timestamp: '2026-01-01T00:01:00Z',
      },
      {
        id: 'msg-4',
        type: 'gemini',
        content: [
          { text: 'Understood, 2-space indentation for this project.' },
        ],
        timestamp: '2026-01-01T00:01:05Z',
      },
    ],
    prompt: 'Please save the preferences I mentioned earlier to memory.',
    assert: async (rig, result) => {
      // Under experimental.memoryManager, the agent persists memories by
      // editing GEMINI.md files directly. The Global tier is not surfaced in
      // this mode, so both team-shared project preferences should land in the
      // project-root GEMINI.md and neither should touch ~/.gemini/GEMINI.md.
      await rig.waitForToolCall('write_file').catch(() => {});
      const writeCalls = rig
        .readToolLogs()
        .filter((log) =>
          ['write_file', 'replace'].includes(log.toolRequest.name),
        );

      const wroteProjectTestCommand = writeCalls.some((log) => {
        const args = log.toolRequest.args;
        return (
          /GEMINI\.md/i.test(args) &&
          !/\.gemini\//i.test(args) &&
          /npm run test/i.test(args)
        );
      });
      expect(
        wroteProjectTestCommand,
        'Expected the project test-command convention to be written to a project-root GEMINI.md (not ~/.gemini/GEMINI.md)',
      ).toBe(true);

      const wroteProjectIndent = writeCalls.some((log) => {
        const args = log.toolRequest.args;
        return (
          /GEMINI\.md/i.test(args) &&
          !/\.gemini\//i.test(args) &&
          /2[- ]space/i.test(args)
        );
      });
      expect(
        wroteProjectIndent,
        'Expected the project-specific "2-space indentation" preference to be written to a project-root GEMINI.md (not ~/.gemini/GEMINI.md)',
      ).toBe(true);

      const leakedToGlobal = writeCalls.some((log) => {
        const args = log.toolRequest.args;
        return (
          /\.gemini\/GEMINI\.md/i.test(args) &&
          !/tmp\/[^/]+\/memory/i.test(args)
        );
      });
      expect(
        leakedToGlobal,
        'Project preferences must NOT be written to the global ~/.gemini/GEMINI.md',
      ).toBe(false);

      assertModelHasOutput(result);
    },
  });

  const memoryManagerRoutesUserProject =
    'Agent routes personal-to-user project notes to user-project memory';
  evalTest('USUALLY_PASSES', {
    suiteName: 'default',
    suiteType: 'behavioral',
    name: memoryManagerRoutesUserProject,
    params: {
      settings: {
        experimental: { memoryManager: true },
      },
    },
    prompt:
      'Please remember this: the local Postgres dev database for THIS project runs on port 6543 on my machine — this is just my personal local setup, do not commit it to the repo.',
    assert: async (rig, result) => {
      // Under experimental.memoryManager with the User Project bullet
      // surfaced in the prompt, a fact that is project-specific AND
      // personal-to-the-user (must not be committed) should land in the
      // user-project memory file under ~/.gemini/tmp/<hash>/memory/, NOT
      // in the committed ./GEMINI.md and NOT in the global ~/.gemini/GEMINI.md.
      await rig.waitForToolCall('write_file').catch(() => {});
      const writeCalls = rig
        .readToolLogs()
        .filter((log) =>
          ['write_file', 'replace'].includes(log.toolRequest.name),
        );

      const wroteToUserProject = writeCalls.some((log) => {
        const args = log.toolRequest.args;
        return (
          /\.gemini\/tmp\/[^/]+\/memory\/GEMINI\.md/i.test(args) &&
          /6543/.test(args)
        );
      });
      expect(
        wroteToUserProject,
        'Expected the personal-to-user project note to be written to the user-project memory file (~/.gemini/tmp/<hash>/memory/GEMINI.md)',
      ).toBe(true);

      // Defensive: should NOT have written this private note to the
      // committed project GEMINI.md or the global GEMINI.md.
      const leakedToCommittedProject = writeCalls.some((log) => {
        const args = log.toolRequest.args;
        return (
          /\/GEMINI\.md/i.test(args) &&
          !/\.gemini\//i.test(args) &&
          /6543/.test(args)
        );
      });
      expect(
        leakedToCommittedProject,
        'Personal-to-user note must NOT be written to the committed project GEMINI.md',
      ).toBe(false);

      const leakedToGlobal = writeCalls.some((log) => {
        const args = log.toolRequest.args;
        return (
          /\.gemini\/GEMINI\.md/i.test(args) &&
          !/tmp\/[^/]+\/memory/i.test(args) &&
          /6543/.test(args)
        );
      });
      expect(
        leakedToGlobal,
        'Personal-to-user project note must NOT be written to the global ~/.gemini/GEMINI.md',
      ).toBe(false);

      assertModelHasOutput(result);
    },
  });
});
