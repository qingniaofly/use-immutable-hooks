import { useCallback, useEffect, useRef } from 'react'
import Immutable from 'immutable'
import { useImmutable } from './useImmutable'

export default function useImmutableList(params: any) {
    const { keyField = 'id', data = [] } = params || {}
    const [list, setList] = useImmutable(Array.isArray(data) ? data : [])
    const instance = useRef({ list: data, keyField })
    instance.current.keyField = keyField

    const getUpdateRow = useCallback((list: any[], key: number | string, updateRow: any) => {
        const { keyField } = instance.current
        if (!Array.isArray(list)) {
            return
        }
        let newRow = null
        let index = -1
        for (let i = 0, len = list.length; i < len; i++) {
            const row = list[i]
            if (key !== row[keyField]) {
                continue
            }
            // 修改此对象
            newRow = (Immutable.fromJS(row) as any).mergeDeep(updateRow).toJS() // { ...row, ...updateRow }
            index = i
            break
        }
        return { newRow, index }
    }, [])

    const updateRowToList = useCallback((list, key, row) => {
        const result = getUpdateRow(list, key, row)
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

    const updateRow = useCallback((key: number | string, row: any) => {
        setList((list) => {
            updateRowToList(list, key, row)
            return list
        })
    }, [])

    const updateRows = useCallback((rows: any[]) => {
        if (!Array.isArray(rows)) {
            return
        }
        const { keyField } = instance.current
        setList((list) => {
            rows.forEach((r) => {
                const key = r[keyField]
                if (!key) {
                    return
                }
                updateRowToList(list, key, r)
            })
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
