pnpm i

# build
pnpm --filter @litegraph/core build
pnpm --filter @litegraph/nodes-basic build
pnpm --filter @litegraph/nodes-events build
pnpm --filter @litegraph/nodes-logic build
pnpm --filter @litegraph/nodes-math build
pnpm --filter @litegraph/nodes-strings build
pnpm --filter @gausszhou/litegraph build

time=$(date "+%Y-%m-%d %H:%M:%S")
echo "build success in $time"