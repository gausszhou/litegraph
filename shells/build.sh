pnpm i

# build
pnpm --filter @gausszhou/litegraph-core build
pnpm --filter @gausszhou/litegraph-nodes-basic build
pnpm --filter @gausszhou/litegraph-nodes-events build
pnpm --filter @gausszhou/litegraph-nodes-logic build
pnpm --filter @gausszhou/litegraph-nodes-math build
pnpm --filter @gausszhou/litegraph-nodes-strings build
pnpm --filter @gausszhou/litegraph build

time=$(date "+%Y-%m-%d %H:%M:%S")
echo "build success in $time"