# use-immutable

A hook to use [immutable]

# Installation

`npm install immutable use-immutable-hooks`

# API


## Hooks

### useImmutable

`useImmutable(initialState)` is very similar to [`useState`](https://reactjs.org/docs/hooks-state.html).



### useImmutableList

基于useImmutable的List, 对外暴露 list, SetList,updateRow, updateRows方法

| 参数 | 说明 | 类型 | 默认值 | 版本 |
|:----- |:-----|:-----|:-----|:-----|
| list | state数据 | any[] | [] | 0.1.0 |
| setList | 修改state数据 | state , (state) => state |- | 0.1.0 |
| updateRow | 修改列表的某一行数据 |  (key: number,string, row: T, callback: (row: T, updateRow: T, index: number) => void) => void |- | 0.1.7 |
| updateRows | 批量修改列表行数据 | (rows: T[], callback: (row: T, updateRow: T, index: number) => void) => void | - | 0.1.7 |


## 工具类API


### factory

`factory(obj)`, 将传入的对应使用`Immutable.fromJS(obj).toJS()`处理后返回



### produce

`produce(fn: (state) => state|void)`, 将传入的对应fn使用直接修改原始对象后返回



### mergeDeep

为了解决object层级较深的时候，修改了数据组件不渲染

`mergeDeep(obj, updateObj)`

