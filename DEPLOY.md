# Deploying v2 to web-app-1 and web-app-2

Two servers sit behind the load balancer and serve the same hostname. Nothing routes a
visitor's chunk requests to the same machine that gave them their HTML, so the two servers
must be able to answer for each other's pages — during the deploy as well as after it.

## The procedure

After the backend CI deployment succeeds, run this on web-app-1:

```bash
cd ~/buyology-v2
git pull --ff-only origin main
bash scripts/deploy-v2.sh
```

The script builds once in a private temporary checkout, using the commit as the build
ID and `NEXT_PUBLIC_API_BASE=https://api.buyology.online` (or an exported override).
It copies the existing environment files into that private build directory and removes
the directory on exit. The live build stays available while dependencies and the new
build are prepared. Old static assets from both replicas are merged into the new bundle,
the identical bundle is shipped to both, and their `buyology-v2` PM2 processes restart.
The script uses the existing `web-app-2` SSH alias and `~/buyology-v2` remote checkout;
both replicas must already be provisioned before using it.

Building separately on each machine also works, because `generateBuildId` pins the build id to
the commit — but only if both machines are on the *same commit* and build within moments of each
other. Copying one build is simply less to get wrong.

## Never delete the old static directory

The obvious line is the damaging one:

```bash
rm -rf .next/standalone/.next/static && cp -r .next/static .next/standalone/.next/static   # NO
```

Next cleans the build directory itself, so even omitting an explicit `rm` is not enough
if you build inside the live checkout. The script builds separately and retains old
static assets. Chunk filenames are content hashes: old tabs still need their old names.
Deleting them causes a ChunkLoadError when the visitor navigates. Merge new assets into
the prepared bundle instead:

```bash
cp -r .next/static/. .next/standalone/.next/static/                                        # YES
```

Sweep the accumulation occasionally, well past any session that could still reference it:

```bash
find .next/standalone/.next/static/chunks -type f -mtime +30 -delete
```

## The trailing `/.` is not a typo

`cp -r public .next/standalone/public` copies the directory *into* the target when the target
already exists, producing `.next/standalone/public/public` — and the site then serves none of it.
It only looked correct because the old script deleted the destination first, so `cp` was always
creating it fresh. Once we stop deleting, the form has to change with it:

```bash
cp -r public/. .next/standalone/public/                  # contents into the directory
cp -r .next/static/. .next/standalone/.next/static/      # same rule
```

If a server has already been deployed with the old command, check for and remove the nested copy
once:

```bash
rm -rf .next/standalone/public/public
```

## Why the gap between the two restarts matters

Between restarting the first server and the second, one machine serves new HTML and the other
serves old. Chunk requests are balanced independently of the page request, so a visitor can be
handed a page by one and refused its scripts by the other. Keep the two restarts seconds apart,
not minutes, and never leave a deploy half-finished.

## What the site does when it happens anyway

`app/error.tsx` recognises a chunk error and reloads the page once, at most once every ten
minutes. Fresh HTML references chunks that exist, so the reload fixes it. That is a safety net for
the seconds around a deploy — it is not a substitute for the two rules above.
