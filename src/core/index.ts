import { useState, useCallback } from 'react'
import { IUpdater, produce } from './common'

export type ImmutableHook<T> = [T, IUpdater<T>]

export function useImmutable<S = any>(initialValue: S | (() => S)): ImmutableHook<S>
export function useImmutable(initialValue: any) {
    const [val, updateValue] = useState(() => (typeof initialValue === 'function' ? initialValue() : initialValue))
    return [
        val,
        useCallback((updater) => {
            if (typeof updater === 'function') updateValue(produce(updater))
            else updateValue(updater)
        }, []),
    ]
}
