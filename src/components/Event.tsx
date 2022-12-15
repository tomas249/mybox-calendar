import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { formatHours } from '../App'

// export default function TitleWithCounter() {
//   const [text, setText] = useState('')
//   return (
//     <div className="w-[850px] mx-auto py-10 text-white">
//       <div>
//         Repeat sign: $
//       </div>
//       <input className='my-5 text-black' type="text" value={text} onChange={e => setText(e.target.value)} />
//       <div>
//         {Array(4).fill(null).map((_, index) => (
//           <div key={index}>[{index+1}]: {text.replace('$', String(index+1))}</div>
//         ))}
//       </div>
//     </div>
//   )
// }


const TASKS = [
  {
    title: 'task one',
    duration: 30,
    completed: 0,
    startAt: 0
  },
  {
    title: 'task two',
    duration: 90,
    completed: 0,
    startAt: 30
  },
  {
    title: 'task three',
    duration: 60,
    completed: 0,
    startAt: 120
  },
  {
    title: 'task four',
    duration: 90,
    completed: 0,
    startAt: 180
  },
]
const tasksTotalDuration = TASKS.reduce((acc, task) => acc + task.duration, 0)
const tasksTotalDurationFloor = tasksTotalDuration - (tasksTotalDuration % 60)
const tasksTotalDurationCeil = tasksTotalDurationFloor + 60

const date = new Date()
const minutes = date.getHours() * 60 + date.getMinutes()
// const minutes = 945
const roundedMinutes = minutes - (minutes % 5)
const roundedHourInMinutes = minutes - (minutes % 60)

const onlyRoundedMinutesCeil = roundedMinutes - roundedHourInMinutes + 5 

const final = roundedHourInMinutes + tasksTotalDurationCeil + 60

export default function HoursList() {
  const [hours, setHours] = useState(tasksTotalDurationCeil / 60 + 1) // add 1h to make it look better at the end
  const [step, setStep] = useState(roundedMinutes - roundedHourInMinutes)
  const [currentTime, setCurrentTime] = useState(minutes)
  const [startTime, setStartTime] = useState(onlyRoundedMinutesCeil)

  const height = hours * 60

  function handleChangeStartTime(time: number) {
    setStartTime(time)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(p => {
        const newTime = p + 1
        if (newTime === final) {
          clearInterval(interval)
        }
        if (newTime % 5 === 0) {
          setStep(p => p + 5)
        }
        return p + 1
      })
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[850px] mx-auto py-10 text-white">
      <div className="h-20">
        <label htmlFor="time">Start time:</label>

        <select onChange={e => handleChangeStartTime(parseInt(e.target.value))} value={startTime} name="time" id="time" className="text-black ml-2">
          {Array(24 * 60 / 5).fill(null).map((_, index) => (
            <option key={index} value={index * 5}>{formatHours(index * 5)}</option>
          ))}
        </select>
      </div>
      <Container>
        <div>
          {Array(hours).fill(null).map((_, idx) => (
            <div key={idx} className='hour'>
              <span>{formatHours(roundedHourInMinutes + idx * 60)}</span>
              <div className='hour-inside' />
              <div className='hour-half' />
            </div>
          ))}
          <div className='hour'>
            <span>{formatHours(roundedHourInMinutes + tasksTotalDurationCeil + 60)}</span>
          </div>
        </div>
        {TASKS.map((task, idx) => (
          <TaskStyled key={idx} top={startTime + task.startAt} height={task.duration} style={
            step > task.startAt ? { backgroundColor: '#9DB599' } : {}
          } />
        ))}
        <Slider height={height} type="range" min={0} max={hours * 60} step={5} value={step} onChange={e => setStep(parseInt(e.target.value))} />
        <SliderMark top={step}>
          <SliderMarkHour>{formatHours(step + roundedHourInMinutes)}</SliderMarkHour>
        </SliderMark>
      </Container>
    </div>
  )
}

const Slider = styled.input<{ height: number }>`
  position: absolute;
  transform: rotate(90deg);
  top: ${p => p.height / 2 - 8}px;
  left: ${p => 860 - p.height / 2}px;
  width: calc(${p => p.height}px + 8px + 8px);
  -webkit-appearance: none;
  background: transparent;
  z-index: 2;
`

const SliderMark = styled.div<{ top: number }>`
  position: absolute;
  width: 790px;
  top: ${p => p.top}px;
  left: 80px;
  border-top: 3px solid red;
`

const SliderMarkHour = styled.span`
  position: absolute;
  top: -16px;
  right: -50px;
`

const Container = styled.div`
  position: relative;

  .hour {
    height: 60px;
    border-top: 1px solid;
    margin-left: 60px;
    position: relative;

    span {
      position: absolute;
      top: -12px;
      left: -50px;
    }

    .hour-inside {
      height: 100%;
      margin-left: 20px;
      border-left: 1px solid;
    }

    .hour-half {
      position: absolute;
      top: 30px;
      left: 10px;
      border-top: 1px solid;
      width: 10px;
    }
  }
`

const LastHour = styled.div`
  height: 60px;
  border-top: 1px solid;
  margin-left: 60px;
`

type TaskStyledProps = {
  top: number;
  height: number;
}
const TaskStyled = styled.div<TaskStyledProps>`
  position: absolute;
  height: ${p => p.height - 1}px;
  top: ${p => p.top}px;
  left: 80px;
  width: calc(100% - 80px);
  background-color: #94C98B;
  border-radius: 8px;
`