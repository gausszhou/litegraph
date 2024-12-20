pnpm i

# build full version
pnpm --filter @gausszhou/litegraph build
# build core
pnpm --filter @gausszhou/litegraph-core build
# build nodes
pnpm --filter @gausszhou/litegraph-nodes-audio build
pnpm --filter @gausszhou/litegraph-nodes-basic build
pnpm --filter @gausszhou/litegraph-nodes-events build
pnpm --filter @gausszhou/litegraph-nodes-input build
pnpm --filter @gausszhou/litegraph-nodes-logic build
pnpm --filter @gausszhou/litegraph-nodes-math build
pnpm --filter @gausszhou/litegraph-nodes-midi build
pnpm --filter @gausszhou/litegraph-nodes-strings build
pnpm --filter @gausszhou/litegraph-nodes-widget build

time=$(date "+%Y-%m-%d %H:%M:%S")
echo "build success in $time"