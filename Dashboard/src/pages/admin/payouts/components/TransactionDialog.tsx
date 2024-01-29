import { ModalFrame } from './ModalFrame'
import TransactionSequence from './TransactionSequence'

// prettier-ignore
const TransactionDialog = ({
    is_open,
    title,
    data,
    on_completion,
    on_close
}: {
    is_open: boolean
    title: string
    data: { title: string; action: () => any }[]
    on_completion: () => any
    on_close?: () => any
}) => {
    function close() {
        if (on_close) {
            on_close()
        }
    }

    return (
        <ModalFrame title={title} is_open={is_open} close={close}>
            <TransactionSequence
                initiate={true}
                data={data}
                on_completion={() => {
                    on_completion()
                    close()
                }}
            />
        </ModalFrame>
    )
}

export default TransactionDialog
