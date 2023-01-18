import Immutable from 'immutable'

export function mergeDeep(obj: any, obj2: any) {
    let r = obj
    try {
        r = (Immutable.fromJS(obj) as any).mergeDeep(obj2).toJS()
    } catch (e) {
        //
    }
    return r
}

export function factory(obj: any) {
    let r = obj
    try {
        r = Immutable.fromJS(obj).toJS()
    } catch (e) {
        //
    }
    return r
}

export type IDraft<S> = S
export type IStateFunction<T> = (state: IDraft<T>) => T | void
export type IUpdater<T> = (arg: T | IStateFunction<T>) => T | void
export function produce(updater: IUpdater<any>) {
    return (state: any) => {
        let r
        return factory(((r = updater(state)), r === undefined ? state : r))
    }
}
