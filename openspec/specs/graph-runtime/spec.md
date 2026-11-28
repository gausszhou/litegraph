# 图运行时规范

## Purpose

LGraph 是 LiteGraph 的节点图运行时：它持有节点与链接、维护可执行的拓扑顺序、按帧或按间隔驱动执行循环，并能把整张图序列化为稳定数据再恢复。本规范只约束这些对外可观察的运行时契约，不涉及画布渲染与交互细节。

## Requirements

### Requirement: 节点增删与图归属

LGraph SHALL 在添加节点时为未指定 id 的节点分配唯一 id，并在 id 与已有节点冲突时改分配新 id；移除节点 SHALL 先断开其两侧全部链接、清空对端槽位并调用移除回调，再把节点从图中摘除。每次结构性增删 SHALL 递增图的变更版本，供依赖版本号的界面刷新。

#### Scenario: 添加节点分配唯一 id

- **WHEN** 向空图依次添加三个未设置 id 的节点
- **THEN** 三个节点获得互不相同且递增的 id
- **AND** 能按 id 找回对应节点

#### Scenario: 重复 id 被重新分配

- **WHEN** 添加一个 id 与已有节点相同的节点
- **THEN** 新节点获得另一个唯一 id
- **AND** 原节点保留自己的 id

#### Scenario: 移除节点断开全部链接

- **WHEN** 移除一个两侧都有连接的节点
- **THEN** 相关链接从图中消失，对端槽位被清空
- **AND** 该节点不再属于任何图

### Requirement: 连接的建立、拒绝与断开

节点连接 SHALL 仅在目标节点已归属图、目标输入槽存在、两端插槽类型兼容且未被节点连接回调否决时创建链接，并把链接登记到图与两端槽位；任一条件不满足时 MUST 返回空值且不修改图。向已占用的输入槽连接 SHALL 以新链接替换旧链接；同一输出 SHALL 允许连接多个输入。

#### Scenario: 合法连接建立链接

- **WHEN** 源输出与目标输入类型兼容且两节点都已加入图
- **THEN** 连接返回新链接，图以链接 id 登记它
- **AND** 目标输入槽引用该链接 id

#### Scenario: 自连被拒绝

- **WHEN** 节点尝试连接到自身
- **THEN** 连接返回空值
- **AND** 图中不新增链接

#### Scenario: 类型不匹配被拒绝

- **WHEN** 输出槽类型与输入槽类型不兼容
- **THEN** 连接返回空值且两槽位保持原状

#### Scenario: 已占用输入槽被替换

- **WHEN** 对一个已有连线的输入槽再次连接
- **THEN** 旧链接从图中移除
- **AND** 只有新链接生效

#### Scenario: 目标节点未入图时拒绝连接

- **WHEN** 目标节点不属于任何图
- **THEN** 连接抛出错误且不创建链接

#### Scenario: 连接回调可否决连接

- **WHEN** 节点的连接回调返回 false
- **THEN** 连接返回空值且不创建链接

#### Scenario: 断开与删除链接

- **WHEN** 调用输入断开、输出断开或删除链接
- **THEN** 该链接从图中删除
- **AND** 对端槽位被清空

### Requirement: 执行顺序计算

图 SHALL 在结构变化后重算执行顺序：无输入链接的节点先入队，目标节点仅在其全部输入链接被访问后入队；环路节点 MUST 追加在序列末尾且不丢失。最终顺序 SHALL 按节点 priority 升序排列，priority 相同时保持拓扑次序。

#### Scenario: 上游先于下游

- **WHEN** 节点 A 的输出连接到节点 B 的输入
- **THEN** 执行顺序中 A 位于 B 之前

#### Scenario: 增删后顺序刷新

- **WHEN** 添加或移除节点、或断开链接
- **THEN** 执行顺序被重新计算
- **AND** 已移除节点不再出现在执行顺序中

#### Scenario: 环路节点不丢失

- **WHEN** 两个节点互相连接形成环
- **THEN** 两个节点仍出现在执行顺序中
- **AND** 它们被追加在无环部分之后

#### Scenario: priority 重排

- **WHEN** 节点设置了不同的 priority
- **THEN** 顺序按 priority 升序排列
- **AND** priority 相同时保持拓扑次序

### Requirement: 运行循环

start(interval) SHALL 将图置为运行状态、向全部节点广播 onStart，并按帧或按间隔调用 runStep；stop() SHALL 置为停止状态、清除定时器并广播 onStop，重复调用 MUST 幂等。runStep() SHALL 只执行 mode 为 ALWAYS 且实现 onExecute 的节点，每轮触发 onExecuteStep，全部轮次结束后触发一次 onAfterExecute。执行异常且未开启抛出时 MUST 记录错误并停止图。

#### Scenario: 启动与停止幂等

- **WHEN** 调用 start(1000) 后再次调用 start()
- **THEN** 图处于运行状态
- **AND** 调用 stop() 后为停止状态，重复 stop() 不抛错

#### Scenario: 每轮执行可执行节点

- **WHEN** 调用 runStep(1)
- **THEN** mode 为 ALWAYS 且实现 onExecute 的节点各被调用一次
- **AND** 图的迭代计数递增

#### Scenario: 跳过非 ALWAYS 节点

- **WHEN** 节点的 mode 不是 ALWAYS
- **THEN** runStep() 不调用其 onExecute

#### Scenario: 步骤与收尾回调

- **WHEN** 调用 runStep(2)
- **THEN** onExecuteStep 每轮各触发一次
- **AND** onAfterExecute 在全部轮次结束后触发一次

#### Scenario: 执行异常停止图

- **WHEN** 节点 onExecute 抛出异常且未开启抛出错误
- **THEN** 图记录执行错误
- **AND** 图状态变为停止

### Requirement: 图级输入输出同步

LGraph SHALL 以名称为键维护图级 inputs 与 outputs 元数据（名称、类型、值）；执行时图输入节点 SHALL 把同名图输入值写到输出槽，无同名输入时回退节点自身属性值；图输出节点 SHALL 把输入槽值写回同名图输出。图内节点类型变更 SHALL 同步到图级同名条目的类型，增删改名 SHALL 更新图级条目且不产生重复名称。

#### Scenario: 图输入转发图输入值

- **WHEN** 图输入 in 的值为 7 且图输入节点已连接到目标
- **THEN** 执行后该链接的数据为 7

#### Scenario: 无图输入时回退属性值

- **WHEN** 图中不存在同名图输入
- **THEN** 图输入节点输出其自身属性值

#### Scenario: 图输出写回图输出

- **WHEN** 图输出节点的输入槽收到 42
- **THEN** 执行后对应图输出的值为 42

#### Scenario: 增删与改名

- **WHEN** 添加、改名或删除图输入
- **THEN** 图级条目相应新增、改名或删除
- **AND** 已存在的同名条目不会被重复添加

#### Scenario: 类型同步

- **WHEN** 修改图输入节点的类型
- **THEN** 其输出槽类型与图级条目的类型同步更新

### Requirement: 序列化与反序列化往返

serialize() SHALL 产出包含节点、链接、分组、config、extra、版本号与 id 计数器的对象；links MUST 使用 [id, origin_id, origin_slot, target_id, target_slot, type] 紧凑数组。configure() SHALL 按原 id 重建节点与链接、恢复分组与自定义字段并重算执行顺序；对同一数据的再次序列化 MUST 等价。未注册的节点类型 MUST 生成标记为出错的占位节点并保留原始序列化数据，configure() 的返回值 MUST 指出存在错误。

#### Scenario: 往返保留图结构

- **WHEN** 对含节点与链接的图序列化后深拷贝并恢复
- **THEN** 节点 id、位置与输入输出槽指向保持一致
- **AND** 再次序列化的结果与首次等价

#### Scenario: 链接使用紧凑数组

- **WHEN** 序列化含链接的图
- **THEN** links 的每个元素是六元组（链接 id、源节点、源槽、目标节点、目标槽、类型）

#### Scenario: 未知节点类型保留占位

- **WHEN** 反序列化数据含未注册的节点类型
- **THEN** 生成标记为出错的占位节点并保留原始序列化数据
- **AND** configure() 的返回值为真以指出存在错误

#### Scenario: 分组与自定义字段

- **WHEN** 图中含分组、config 与 extra
- **THEN** 往返后分组标题与边界、config、extra 均保持一致

#### Scenario: 变更版本与序列化版本

- **WHEN** 完成一次反序列化
- **THEN** 图的变更版本递增
- **AND** 序列化的版本字段等于引擎版本
