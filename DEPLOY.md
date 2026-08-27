# Deploying v2 to web-app-1 and web-app-2

Two servers sit behind the load balancer and serve the same hostname. Nothing routes a
visitor's chunk requests to the same machine that gave them their HTML, so the two servers
must be able to answer for each other's pages — during the deploy as well as after it.

## The procedure

Build once, ship the same files to both servers, restart them close together.

```bash
# On the build machine (or web-app-1), once:
cd ~/v2.buyology.online
git pull
npm ci                 # npm install only when dependencies actually changed
npm run build

# Merge the new assets in — see "Never delete the old static directory" below.
cp -r .next/static/. .next/standalone/.next/static/
cp -r public/.        .next/standalone/public/

# Ship the identical build to the other server, then restart both.
rsync -a --delete .next/standalone/ web-app-2:~/v2.buyology.online/.next/standalone/
pm2 restart buyology-v2                    # here
ssh web-app-2 'pm2 restart buyology-v2'    # and there
```

Building separately on each machine also works, because `generateBuildId` pins the build id to
the commit — but only if both machines are on the *same commit* and build within moments of each
other. Copying one build is simply less to get wrong.

## Never delete the old static directory

The obvious line is the damaging one:

```bash
rm -rf .next/standalone/.next/static && cp -r .next/static .next/standalone/.next/static   # NO
```

Chunk filenames are content hashes, so a new build writes new names and leaves the old ones
untouched. Deleting them removes the files that every already-open tab is still asking for, and
those tabs get a ChunkLoadError the moment the visitor navigates. Merging costs a few megabytes
and makes the old pages keep working:

```bash
cp -r .next/static/. .next/standalone/.next/static/                                        # YES
```

Sweep the accumulation occasionally, well past any session that could still reference it:

```bash
find .next/standalone/.next/static/chunks -type f -mtime +30 -delete
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
