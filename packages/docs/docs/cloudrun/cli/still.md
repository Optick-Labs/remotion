---
image: /generated/articles-docs-cloudrun-cli-still.png
id: still
sidebar_label: still
title: "npx remotion cloudrun still"
slug: /cloudrun/cli/still
crumb: "Cloud Run CLI Reference"
---

<ExperimentalBadge>
<p>Cloud Run is in <a href="/docs/cloudrun-alpha">Alpha</a>, which means APIs may change in any version and documentation is not yet finished. See the <a href="https://remotion.dev/changelog">changelog to stay up to date with breaking changes</a>.</p>
</ExperimentalBadge>

Using the `npx remotion cloudrun still` command, you can render an image on GCP.

The structure of a command is as follows:

```
npx remotion cloudrun still <serve-url> [<still-id>] [<output-location>]
```

- The serve URL is obtained by deploying a Remotion project to a GCP Storage Bucket using the [`sites create`](/docs/cloudrun/cli/sites#create) command or calling [`deployService()`](/docs/cloudrun/deployservice).
- The [still ID](/docs/terminology#composition-id). If not specified, the list of compositions will be fetched and you can choose a composition.
- The `output-location` parameter is optional. If you don't specify it, the image is stored in your Cloud Storage bucket. If you specify a location, it gets downloaded to your device in an additional step.

## Example commands

Rendering a still, passing the service name:

```
npx remotion cloudrun still https://storage.googleapis.com/remotioncloudrun-123asd321/sites/abcdefgh/index.html tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800
```

Using the site name as opposed to the full serve-url:

```
npx remotion cloudrun still test-site tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800
```

Passing in input props:

```
npx remotion cloudrun still test-site tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800 --props='{"hi": "there"}'
```

## Flags

### `--region`

The [GCP region](/docs/cloudrun/region-selection) to select. For lowest latency, the service, site and output bucket should be in the same region.

### `--props`

[React Props to pass to the root component of your still.](/docs/parameterized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`).

### `--privacy`

One of:

- `"public"` (_default_): The rendered still is publicly accessible under the Cloud Storage URL.
- `"private"`: The rendered still is not publicly available, but is available within the GCP project to those with the correct permissions.

### `--force-bucket-name`

Specify a specific bucket name to be used for the output. The resulting Google Cloud Storage URL will be in the format `gs://{bucket-name}/renders/{render-id}/{file-name}`. If not set, Remotion will choose the right bucket to use based on the region.

### `--jpeg-quality`

[Value between 0 and 100 for JPEG rendering quality](/docs/config#setjpegquality). Doesn't work when a PNG is rendered.

### `--image-format`

[`jpeg` or `png` - JPEG is faster, but doesn't support transparency.](/docs/config#setStillImageFormat) The default image format is `jpeg`.

### `--scale`

[Scales the output frame by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details.

### `--env-file`

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](/docs/env-variables)

### `--out-name`

The file name of the still output as stored in the Cloud Storage bucket. By default, it is `out` plus the appropriate file extension, for example: `out.png`. Must match `/([0-9a-zA-Z-!_.*'()/]+)/g`.

### `--cloud-run-url`

Specify the url of the service which should be used to perform the render. You must set either `cloud-run-url` _or_ `service-name`, but not both.

### `--service-name`

Specify the name of the service which should be used to perform the render. This is used in conjunction with the region to determine the service endpoint, as the same service name can exist across multiple regions. You must set either `cloud-run-url` _or_ `service-name`, but not both.
