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
    const { keyField = 'id', data = [], debug = false } = params || {}
    const [list, setList] = useImmutable(Array.isArray(data) ? data : [])
    const instance = useRef({ list: data, keyField, debug })
    instance.current.keyField = keyField
    instance.current.debug = debug

    const getUpdateRow = useCallback((list: any[], updateRowMap: Map<string | number, any>, i: number, callback: (row: any, updateRow: any, index: number) => void) => {
        const { keyField } = instance.current
        if (!Array.isArray(list)) {
            return
        }
        let newRow = null
        let index = -1
        const row = list[i]
        const k = row[keyField]
        if (updateRowMap.has(k)) {
            const updateRow = updateRowMap.get(k)
            index = i
            if (typeof callback === 'function') {
                callback(row, updateRow, index)
            }
            // 修改此对象
            newRow = mergeDeep(row, updateRow) // { ...row, ...updateRow }
        }
        return { newRow, index }
    }, [])

    const updateRowToList = useCallback((list: any[], updateRowMap: Map<string | number, any>, callback: (row: any, updateRow: any, index: number) => void) => {
        const { debug } = instance.current
        if (!Array.isArray(list)) {
            return
        }
        for (let i = 0, len = list.length; i < len; i++) {
            const result = getUpdateRow(list, updateRowMap, i, callback)
            debug && console.log('updateRowToList getUpdateRow result=', result)
            if (!result) {
                continue
            }
            const { newRow, index } = result
            if (!newRow || index <= -1) {
                continue
            }
            debug && console.log('updateRowToList newRow=', newRow)
            list[index] = newRow
        }
        return list
    }, [])

    const updateRow = useCallback((key: number | string, row: any, callback: (row: any, updateRow: any, index: number) => void) => {
        setList((list) => {
            const { debug } = instance.current
            const map = new Map()
            map.set(key, row)
            updateRowToList(list, map, callback)
            debug && console.log('updateRow list=', list)
            return list
        })
    }, [])

    const updateRows = useCallback((rows: any[], callback: (row: any, updateRow: any, index: number) => void) => {
        if (!Array.isArray(rows)) {
            return
        }

        setList((list) => {
            const { keyField, debug } = instance.current
            const map = new Map()
            rows.forEach((r) => {
                const key = r[keyField]
                if (!key) {
                    return
                }
                map.set(key, r)
            })
            // 减少时间复杂度为T = O(n)
            updateRowToList(list, map, callback)
            debug && console.log('updateRows list=', list)
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
