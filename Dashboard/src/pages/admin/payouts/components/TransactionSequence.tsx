import { useEffect, useState } from 'react'
import Transaction from './Transaction'
// prettier-ignore
const TransactionSequence = ({
    data,
    on_completion,
    initiate = true
}: {
    initiate: boolean
    data: { title: string; action: any }[]
    on_completion: any
}) => {
    const [is_completed, set_is_completed] = useState(false)
    const [states, set_states] = useState<string[]>(data.map((_, index) => (index == 0 ? 'ready' : 'null')))
    const [output, set_output] = useState<any>({})

    function set_state(index: number, new_state: string) {
        const new_states = states.map((old_state, i) => (i == index ? new_state : old_state))
        set_states(new_states)
    }

    if (!is_completed && states.every((state) => state === 'succeeded')) {
        set_is_completed(true)
        on_completion()
    }

    function generate_action_and_proceed(index: number, action: any) {
        return async () => {
            try {
                set_state(index, 'loading')
                const result = await action(output)
                set_state(index, 'succeeded')
                set_output(result)
            } catch (error: any) {
                set_state(index, 'failed')
                alert(JSON.stringify(error.message))
                console.error(error)
            }
        }
    }

    useEffect(() => {
        console.log(states)
        if (initiate) {
            const ready_index = states.indexOf('ready')
            if (ready_index >= 0) {
                const action = data[ready_index].action
                const action_and_proceed = generate_action_and_proceed(ready_index, action)
                action_and_proceed()
            }
        }
    }, [states])

    return (
        <>
            {data.map(({ title, action }, index) => {
                const action_and_proceed = generate_action_and_proceed(index, action)

                let state = states[index]
                if (index > 0 && state == 'null' && states[index - 1] == 'succeeded') {
                    state = 'ready'
                }

                return <Transaction key={index} title={title} onClick={action_and_proceed} state={state} />
            })}
        </>
    )
}

export default TransactionSequence
