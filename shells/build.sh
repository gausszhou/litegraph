export NODE_OPTIONS="--max_old_space_size=8192"

pnpm i

# build
pnpm --filter @litegraph/core build
pnpm --filter @litegraph/nodes-basic build
pnpm --filter @litegraph/nodes-events build
pnpm --filter @litegraph/nodes-logic build
pnpm --filter @litegraph/nodes-math build
pnpm --filter @litegraph/nodes-strings build

time=$(date "+%Y-%m-%d %H:%M:%S")
echo "build success in $time"