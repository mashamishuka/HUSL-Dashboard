import { FaCheck, FaClock, FaPlay, FaStop, FaTimes } from 'react-icons/fa'

// prettier-ignore
function icon_for_state(state: string) {
    switch (state) {
        case 'succeeded':
            return <FaCheck />
        case 'failed':
            return <FaTimes />
        case 'ready':
            return <FaPlay />
        case 'loading':
            return <FaClock />
        case 'null':
            return <FaStop />
        default:
            throw new Error('invalid state ' + state)
    }
}

// prettier-ignore
const Transaction = ({ title, onClick, state }: { title: string; onClick: any; state: string }) => {
    const enabled = state == 'ready'
    return (
        <div
            className={`p-3 m-3 text-white border shadow-xl bg-white/10 rounded-[15px] ${enabled ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
            onClick={() => (enabled ? onClick() : null)}>
            <div className="inline-block ml-3 mr-3 align-top mt-[7px] text-[26px]">{icon_for_state(state)}</div>
            <div className="inline-block align-top text-[26px]">{title}</div>
        </div>
    )
}

export default Transaction
