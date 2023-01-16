import { useState, useCallback } from 'react'
import Immutable from 'immutable'

export function produce(updater: Updater<any>) {
    return (state: any) => Immutable.fromJS(updater(state)).toJS()
}

export type Draft<S> = S
export type StateFunction<T> = (state: Draft<T>) => void;
export type Updater<T> = (arg: T | StateFunction<T>) => void;
export type ImmutableHook<T> = [T, Updater<T>];

export function useImmutable<S = any>(initialValue: S | (() => S)): ImmutableHook<S>;
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
