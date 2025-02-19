import {removeATSHVInstructions} from './helpers/remove-a-s-t-curves';
import type {Instruction, ReducedInstruction} from './helpers/types';
import {normalizeInstructions} from './normalize-path';

/**
 * @description Takes an array of Instruction's and reduces the amount of instruction types them so the path only consists of M, L, C, Q and Z instructions.
 * @param {Array} instruction
 * @see [Documentation](https://www.remotion.dev/docs/paths/reduce-instructions)
 */
export const reduceInstructions = (
	instruction: Instruction[]
): ReducedInstruction[] => {
	const simplified = normalizeInstructions(instruction);
	return removeATSHVInstructions(simplified);
};
