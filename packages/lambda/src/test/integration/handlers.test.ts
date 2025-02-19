import {VERSION} from 'remotion/version';
import {expect, test} from 'vitest';
import {LambdaRoutines} from '../../defaults';
import {callLambda} from '../../shared/call-lambda';

test('Call function locally', async () => {
	expect(
		await callLambda({
			payload: {},
			type: LambdaRoutines.info,
			functionName: 'remotion-dev-lambda',
			region: 'us-east-1',
			receivedStreamingPayload: () => undefined,
			timeoutInTest: 120000,
			retriesRemaining: 0,
		})
	).toEqual({type: 'success', version: VERSION});
});
