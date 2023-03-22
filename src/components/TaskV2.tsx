import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { formatHours } from "../App";

import { TasksList } from "./elements";

const TASKS = [
  {
    title: "task one",
    duration: 30,
  },
  {
    title: "task two",
    duration: 90,
  },
  {
    title: "task three",
    duration: 60,
  },
  {
    title: "task four",
    duration: 110,
  },
];

const totalDuration = TASKS.reduce((acc, task) => acc + task.duration, 0);

export default function Task() {

  return (
    <div className="h-screen max-w-7xl mx-auto py-10 text-white flex">
      <TasksPlannerContainer>
        <TasksPlanner />
      </TasksPlannerContainer>
      <OptionsContainer>
        <TasksOptions />
      </OptionsContainer>
    </div>
  );
}

const TasksPlannerContainer = styled.div`
  // background-color: green;
  width: 600px;
  overflow-y: scroll;
  margin-right: 2rem;
`;

const OptionsContainer = styled.div`
  width: 600px;
  margin-left: auto;
`;

// Planner
// const date = new Date();
// const minutes = date.getMinutes();
// const hours = date.getHours();
// const totalMinutes = hours * 60 + minutes;

const roundFloor = (num: number, factor: number): number => num - (num % factor);
const roundCeil = (num: number, factor: number): number => roundFloor(num, factor) + (num % factor === 0 ? 0 : factor);

const calculateOffsets = (progress: number, minute: number) => {
  const minuteCeil = roundCeil(minute, 5);
  const progressDiff = progress - minuteCeil

  if (progressDiff > 0) {
    return {
      timeOffset: progressDiff,
      taskOffset: 0
    }
  } else {
    return {
      timeOffset: 0,
      taskOffset: Math.abs(progressDiff)
    }
  }
}

export function TasksPlanner() {
  const [time, setTime] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  const [timeOffset, setTimeOffset] = useState(0);
  const [taskOffset, setTaskOffset] = useState(0);

  useEffect(() => {
    const offset = calculateOffsets(sliderValue, time);

    // setTimeOffset(offset.timeOffset);
    setTaskOffset(offset.taskOffset);
  }, [time, sliderValue])

  return (
    <div>
      <div className="flex flex-col mb-5">
        <span>TIME_OFFSET: {formatHours(timeOffset)}</span>
        <span>TASKS_OFFSET: {formatHours(taskOffset)}</span>
      </div>
      <div className="flex mb-5">
        <span>current time: {formatHours(time)}</span>
        <input className="text-black px-2 ml-5" type="text" value={time} onChange={e => setTime(parseInt(e.target.value || '0'))} />
      </div>
      <div className="flex mb-5">
        <span>progress: {formatHours(sliderValue)}</span>
        <input className="text-black px-2 ml-5" type="text" value={sliderValue} onChange={e => setSliderValue(parseInt(e.target.value || '0'))} />
      </div>
      <div className="flex mb-5">
        <button onClick={() => {
          setInterval(() => {
            // setTime(p => p + 1);
            setSliderValue(p => p + 1);
          }, 1000)
        }}>Start</button>
      </div>
      <Container>
        <TimeListContainer offset={timeOffset}>
          {Array(24)
            .fill(null)
            .map(
              (_, hour) => (
                <div key={hour} className="hour">
                  <span>{formatHours(hour * 60)}</span>
                  <div className="hour-inside" />
                  <div className="hour-half" />
                </div>
              )
            )}
          <div className="hour">
            <span>XX:XX</span>
          </div>
        </TimeListContainer>

        <TasksListContainer offset={taskOffset}>
          {TASKS.map((task, hour) => (
            <div key={hour} style={{
              height: task.duration - 1,
              marginBottom: 1,
              backgroundColor: "#94c98b",
              borderRadius: '8px'
            }}>{task.title}</div>
          ))}
          <div style={{
            position: 'absolute',
            left: '80px',
            backgroundColor: 'red',
            width: '10px',
            height: roundFloor(sliderValue, 5) + 'px',
          }} />
        </TasksListContainer>

        <Slider
          offset={taskOffset}
          height={totalDuration}
          type="range"
          min={0}
          max={totalDuration}
          step={5}
          value={sliderValue}
          onChange={(e) => {
            setSliderValue(parseInt(e.target.value));
          }}
        />
        <SliderMark top={taskOffset + sliderValue}>
          <SliderMarkHour>
            {/* {formatHours(currentTaskProgress)} / {formatHours(TASKS[currentTask].duration)} */}
            {formatHours(sliderValue)}
          </SliderMarkHour>
        </SliderMark>
      </Container>
    </div>
  )
}

const Container = styled.div`
  position: relative;
  margin-top: 20px;
  padding: 0 150px 0 80px;
`

const TimeListContainer = styled.div<{ offset: number }>`
  position: absolute;
  top: ${p => p.offset}px;
  left: 0;
  width: calc(100% - 150px); // 150px is the width of slider (left-margin)
  z-index: -1;

  .hour {
    position: relative;
    height: 60px;
    border-top: 1px solid;
    margin-left: 60px;
  
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

const TasksListContainer = styled.div<{ offset: number }>`
  display: flex;
  flex-direction: column;
  padding-top: ${p => p.offset}px;
`

type TaskStyledProps = {
  top: number;
  height: number;
};
const TaskStyled = styled.div<TaskStyledProps>`
  position: absolute;
  height: ${(p) => p.height - 1}px;
  top: ${(p) => p.top}px;
  left: 80px;
  width: calc(100% - 80px);
  border-radius: 8px;
`

const Slider = styled.input<{ offset: number, height: number }>`
  position: absolute;
  transform: rotate(90deg);
  top: ${(p) => p.offset + p.height / 2 - 8}px;
  right: calc(150px - ${p => (p.height + 16) / 2}px - 15px);
  width: calc(${(p) => p.height}px + 8px + 8px); // 8px to adjust slider button vertically
  -webkit-appearance: none;
  background: transparent;
  z-index: 2;
`;

const SliderMark = styled.div<{ top: number }>`
  position: absolute;
  width: calc(100% - 80px - 150px + 20px); // left-margin + right-margin
  top: ${(p) => p.top - 1}px;
  left: 80px;
  border-top: 3px solid red;
`;

const SliderMarkHour = styled.span`
  position: absolute;
  top: -16px;
  left: calc(100% + 10px);
  width: max-content;
`;




// Options
type TaskAvailableOptions = "timer" | "subtasks" | "settings";
const TaskOptionTabs: { [key in TaskAvailableOptions]: Function } = {
  timer: Timer,
  subtasks: SubTasks,
  settings: Settings,
};

export function TasksOptions() {
  const [currentTab, setCurrentTab] = useState<TaskAvailableOptions>("subtasks");
  const OptionTab = TaskOptionTabs[currentTab];

  return (
    <div>
      <div className="flex">
        <div className="text-2xl flex-1 px-2">
          <button
            onClick={() => setCurrentTab("timer")}
            className={`w-full mx-auto rounded bg-gray-400 hover:bg-gray-500 ${currentTab === "timer" ? "bg-gray-500" : ""
              }`}
          >
            Timer
          </button>
        </div>

        <div className="text-2xl flex-1 px-2">
          <button
            onClick={() => setCurrentTab("subtasks")}
            className={`w-full mx-auto rounded bg-gray-400 hover:bg-gray-500 ${currentTab === "subtasks" ? "bg-gray-500" : ""
              }`}
          >
            SubTasks
          </button>
        </div>

        <div className="text-2xl flex-1 px-2">
          <button
            onClick={() => setCurrentTab("settings")}
            className={`w-full mx-auto rounded bg-gray-400 hover:bg-gray-500 ${currentTab === "settings" ? "bg-gray-500" : ""
              }`}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="mt-5">
        <OptionTab />
      </div>
    </div>
  );
}

function Timer() {
  return <div>Timer</div>;
}

function SubTasks() {
  return <div>SubTasks</div>;
}

function Settings() {
  return <div>Settings</div>;
}
