import { useCallback, useEffect, useRef } from 'react'
import { useImmutable } from './index'
import { IUpdater, mergeDeep } from './common'

export interface ImmutableListHook<T> {
    list: T[]
    setList: IUpdater<T[]>
    updateRow: (key: number | string, row: T, callback: (row: T, updateRow: T, index: number) => void) => void
    updateRows: (rows: T[], callback: (row: T, updateRow: T, index: number) => void) => void
}

export interface ImmutableListHookParams<T> {
    keyField: string
    data: T[]
}

export function useImmutableList<S = any>(params: ImmutableListHookParams<S>): ImmutableListHook<S>
export function useImmutableList(params: any) {
    const { keyField = 'id', data = [] } = params || {}
    const [list, setList] = useImmutable(Array.isArray(data) ? data : [])
    const instance = useRef({ list: data, keyField })
    instance.current.keyField = keyField

    const getUpdateRow = useCallback((list: any[], updateRowMap: Map<string | number, any>, callback: (row: any, updateRow: any, index: number) => void) => {
        const { keyField } = instance.current
        if (!Array.isArray(list)) {
            return
        }
        let newRow = null
        let index = -1
        for (let i = 0, len = list.length; i < len; i++) {
            const row = list[i]
            const k = row[keyField]
            if (!updateRowMap.has(k)) {
                continue
            }
            const updateRow = updateRowMap.get(k)

            if (typeof callback === 'function') {
                callback(row, updateRow, index)
            }
            // 修改此对象
            newRow = mergeDeep(row, updateRow) // { ...row, ...updateRow }
            index = i
            break
        }
        return { newRow, index }
    }, [])

    const updateRowToList = useCallback((list: any[], updateRowMap: Map<string | number, any>, callback: (row: any, updateRow: any, index: number) => void) => {
        const result = getUpdateRow(list, updateRowMap, callback)
        if (!result) {
            return
        }
        const { newRow, index } = result
        if (!newRow || index <= -1) {
            return
        }
        list[index] = newRow
        return list
    }, [])

    const updateRow = useCallback((key: number | string, row: any, callback: (row: any, updateRow: any, index: number) => void) => {
        setList((list) => {
            const map = new Map()
            map.set(key, row)
            updateRowToList(list, map, callback)
            return list
        })
    }, [])

    const updateRows = useCallback((rows: any[], callback: (row: any, updateRow: any, index: number) => void) => {
        if (!Array.isArray(rows)) {
            return
        }
        const { keyField } = instance.current
        setList((list) => {
            const map = new Map()
            rows.forEach((r) => {
                const key = r[keyField]
                if (!key) {
                    return
                }
                map.set(key, r)
            })
            updateRowToList(list, map, callback)
            // 减少时间复杂度为T = O(n)
            return list
        })
    }, [])

    useEffect(() => {
        if (Array.isArray(data)) {
            setList(data)
        }
    }, [data])

    return {
        list,
        setList,
        updateRow,
        updateRows,
    }
}
