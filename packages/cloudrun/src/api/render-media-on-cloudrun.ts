import type {
	AudioCodec,
	ChromiumOptions,
	FrameRange,
	LogLevel,
	PixelFormat,
	ProResProfile,
	VideoImageFormat,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {Internals} from 'remotion';
import type {
	CloudRunCrashResponse,
	CloudRunPayloadType,
	ErrorResponsePayload,
	RenderMediaOnCloudrunOutput,
} from '../functions/helpers/payloads';
import type {GcpRegion} from '../pricing/gcp-regions';
import type {CloudrunCodec} from '../shared/validate-gcp-codec';
import {validateCloudrunCodec} from '../shared/validate-gcp-codec';
import {validatePrivacy} from '../shared/validate-privacy';
import {validateServeUrl} from '../shared/validate-serveurl';
import {getOrCreateBucket} from './get-or-create-bucket';
import {getAuthClientForUrl} from './helpers/get-auth-client-for-url';
import {getCloudrunEndpoint} from './helpers/get-cloudrun-endpoint';

export type RenderMediaOnCloudrunInput = {
	cloudRunUrl?: string;
	serviceName?: string;
	region: GcpRegion;
	serveUrl: string;
	composition: string;
	inputProps?: Record<string, unknown>;
	privacy?: 'public' | 'private';
	forceBucketName?: string;
	outName?: string;
	updateRenderProgress?: (progress: number, error?: boolean) => void;
	codec: CloudrunCodec;
	audioCodec?: AudioCodec;
	jpegQuality?: number;
	audioBitrate?: string | null;
	videoBitrate?: string | null;
	proResProfile?: ProResProfile;
	crf?: number | undefined;
	pixelFormat?: PixelFormat;
	imageFormat?: VideoImageFormat;
	scale?: number;
	everyNthFrame?: number;
	numberOfGifLoops?: number | null;
	frameRange?: FrameRange;
	envVariables?: Record<string, string>;
	chromiumOptions?: ChromiumOptions;
	muted?: boolean;
	forceWidth?: number | null;
	forceHeight?: number | null;
	logLevel?: LogLevel;
	delayRenderTimeoutInMilliseconds?: number;
	concurrency?: number | string | null;
	enforceAudioTrack?: boolean;
	preferLossless?: boolean;
};

/**
 * @description Triggers a render on a GCP Cloud Run service given a composition and a Cloud Run URL.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/renderMediaOnGcp)
 * @param params.cloudRunUrl The URL of the Cloud Run service that should be used. Use either this or serviceName.
 * @param params.serviceName The name of the Cloud Run service that should be used. Use either this or cloudRunUrl.
 * @param params.region The region that the Cloud Run service is deployed in.
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.codec The media codec which should be used for encoding.
 * @param params.forceBucketName The name of the bucket that the output file should be uploaded to.
 * @param params.privacy Whether the output file should be public or private.
 * @param params.outputFile The name of the output file.
 * @param params.updateRenderProgress A callback that is called with the progress of the render.
 * @param params.jpegQuality JPEG quality if JPEG was selected as the image format.
 * @param params.audioCodec The encoding of the audio of the output video.
 * @param params.audioBitrate The target bitrate for the audio of the generated video.
 * @param params.videoBitrate The target bitrate of the generated video.
 * @param params.proResProfile Sets a ProRes profile. Only applies to videos rendered with prores codec.
 * @param params.crf Constant Rate Factor, controlling the quality.
 * @param params.pixelFormat Custom pixel format to use. Usually used for special use cases like transparent videos.
 * @param params.imageFormat Which image format the frames should be rendered in.
 * @param params.scale Scales the output dimensions by a factor.
 * @param params.everyNthFrame Only used if rendering gigs - renders only every nth frame.
 * @param params.numberOfGifLoops Only used if rendering gigs - how many times the gif should loop. Null means infinite.
 * @param params.frameRange Specify a single frame (a number) or a range of frames (a tuple [number, number]) to be rendered.
 * @param params.envVariables Object containing environment variables to be injected in your project.
 * @param params.chromiumOptions Allows you to set certain Chromium / Google Chrome flags.
 * @param params.muted If set to true, no audio is rendered.
 * @param params.forceWidth Overrides default composition width.
 * @param params.forceHeight Overrides default composition height.
 * @param params.logLevel Level of logging that Cloud Run service should perform. Default "info".
 * @param params.delayRenderTimeoutInMilliseconds A number describing how long the render may take to resolve all delayRender() calls before it times out.
 * @param params.concurrency By default, each Cloud Run service renders with concurrency 100% (equal to number of available cores). You may use the option to customize this value.
 * @param params.enforceAudioTrack Render a silent audio track if there wouldn't be any otherwise.
 * @param params.preferLossless Uses a lossless audio codec, if one is available for the codec. If you set audioCodec, it takes priority over preferLossless.
 * @returns {Promise<RenderMediaOnCloudrunOutput>} See documentation for detailed structure
 */

export const renderMediaOnCloudrun = async ({
	cloudRunUrl,
	serviceName,
	region,
	serveUrl,
	composition,
	inputProps,
	codec,
	forceBucketName,
	privacy,
	outName,
	updateRenderProgress,
	jpegQuality,
	audioCodec,
	audioBitrate,
	videoBitrate,
	proResProfile,
	crf,
	pixelFormat,
	imageFormat,
	scale,
	everyNthFrame,
	numberOfGifLoops,
	frameRange,
	envVariables,
	chromiumOptions,
	muted,
	forceWidth,
	forceHeight,
	logLevel,
	delayRenderTimeoutInMilliseconds,
	concurrency,
	enforceAudioTrack,
	preferLossless,
}: RenderMediaOnCloudrunInput): Promise<
	RenderMediaOnCloudrunOutput | CloudRunCrashResponse
> => {
	const actualCodec = validateCloudrunCodec(codec);
	validateServeUrl(serveUrl);
	if (privacy) validatePrivacy(privacy);

	const outputBucket =
		forceBucketName ?? (await getOrCreateBucket({region})).bucketName;

	const cloudRunEndpoint = await getCloudrunEndpoint({
		cloudRunUrl,
		serviceName,
		region,
	});

	const data: CloudRunPayloadType = {
		composition,
		serveUrl,
		codec: actualCodec,
		serializedInputPropsWithCustomSchema: Internals.serializeJSONWithDate({
			indent: undefined,
			staticBase: null,
			data: inputProps ?? {},
		}).serializedString,
		jpegQuality: jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
		audioCodec: audioCodec ?? null,
		audioBitrate: audioBitrate ?? null,
		videoBitrate: videoBitrate ?? null,
		crf: crf ?? null,
		pixelFormat: pixelFormat ?? RenderInternals.DEFAULT_PIXEL_FORMAT,
		imageFormat: imageFormat ?? RenderInternals.DEFAULT_VIDEO_IMAGE_FORMAT,
		scale: scale ?? 1,
		proResProfile: proResProfile ?? null,
		everyNthFrame: everyNthFrame ?? 1,
		numberOfGifLoops: numberOfGifLoops ?? null,
		frameRange: frameRange ?? null,
		envVariables: envVariables ?? {},
		chromiumOptions,
		muted: muted ?? false,
		outputBucket,
		privacy,
		outName,
		forceWidth,
		forceHeight,
		type: 'media',
		logLevel: logLevel ?? 'info',
		delayRenderTimeoutInMilliseconds:
			delayRenderTimeoutInMilliseconds ?? RenderInternals.DEFAULT_TIMEOUT,
		concurrency: concurrency ?? null,
		enforceAudioTrack: enforceAudioTrack ?? false,
		preferLossless: preferLossless ?? false,
	};

	const client = await getAuthClientForUrl(cloudRunEndpoint);

	const postResponse = await client.request({
		url: cloudRunEndpoint,
		method: 'POST',
		data,
		responseType: 'stream',
	});

	const renderResponse = await new Promise<
		RenderMediaOnCloudrunOutput | CloudRunCrashResponse
	>((resolve, reject) => {
		// TODO: Add any sort of type safety
		let response:
			| RenderMediaOnCloudrunOutput
			| ErrorResponsePayload
			| CloudRunCrashResponse;

		const startTime = Date.now();
		const formattedStartTime = new Date().toISOString();

		const stream: any = postResponse.data;

		stream.on('data', (chunk: Buffer) => {
			const chunkResponse = JSON.parse(chunk.toString().trim());
			if (chunkResponse.response) {
				response = chunkResponse.response;
			} else if (chunkResponse.onProgress) {
				updateRenderProgress?.(chunkResponse.onProgress);
			}
		});

		stream.on('end', () => {
			if (!response) {
				const crashTime = Date.now();
				const formattedCrashTime = new Date().toISOString();

				updateRenderProgress?.(0, true);

				resolve({
					status: 'crash',
					cloudRunEndpoint,
					message:
						'Service crashed without sending a response. Check the logs in GCP console.',
					requestStartTime: formattedStartTime,
					requestCrashTime: formattedCrashTime,
					requestElapsedTimeInSeconds: (crashTime - startTime) / 1000,
				});
			} else if (response.status !== 'success' && response.status !== 'crash') {
				throw new Error(response.stack);
			}

			resolve(response);
		});

		stream.on('error', (error: Error) => {
			reject(error);
		});
	});

	return renderResponse;
};
