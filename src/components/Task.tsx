import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { formatHours } from "../App";

const TASKS = [
  {
    title: "task one",
    duration: 30,
    completed: 30,
    startAt: 0,
  },
  {
    title: "task two",
    duration: 90,
    completed: 40,
    startAt: 30,
  },
  {
    title: "task three",
    duration: 60,
    completed: 0,
    startAt: 120,
  },
  {
    title: "task four",
    duration: 110,
    completed: 0,
    startAt: 180,
  },
];

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);

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
type TimeProps = {
  startExact: number;
  endExact: number;
  startFloor: number;
  endCeil: number;
};
function calcTime(startTime: number, duration: number): TimeProps {
  const startExact = startTime;
  const endExact = startExact + duration;

  const startFloor = startExact - (startExact % 60);
  const endCeil = endExact - (endExact % 60) + 60;

  return {
    startExact,
    endExact,
    startFloor,
    endCeil,
  };
}
const date = new Date();
const minutes = date.getHours() * 60 + date.getMinutes();

export function TasksPlanner() {
  const startTimeAbsolute = minutes; // absolute // 3:30 // opt from dropdown
  const startTimeAbsoluteCeil = startTimeAbsolute - (startTimeAbsolute % 5) + 5; // 3:00
  const startTimeRelativeCeil = startTimeAbsoluteCeil % 60; // relative // 00:30
  const durationExact = TASKS.reduce((acc, task) => acc + task.duration, 0);
  const absoluteTime = calcTime(startTimeAbsoluteCeil, durationExact);
  const relativeTime = calcTime(startTimeRelativeCeil, durationExact);
  const durationFloorToCeil = relativeTime.endCeil - relativeTime.startFloor; // indiferent whether it's absolute or relative
  const [sliderValue, setSliderValue] = useState(relativeTime.startExact - (relativeTime.startExact % 5));

  // progress tasks
  const isSliderMoving = useRef(false);
  const timerRef = useRef<any>();
  const [currentTime, setCurrentTime] = useState(minutes);
  const [currentTask, setCurrentTask] = useState(0);
  const [currentTaskProgress, setCurrentTaskProgress] = useState(TASKS[0].completed);

  // hours list : completed time
  // completed time = 70 min
  // current time = 15 * 60 + 43
  // partial time = 43
  // offset = completed time - partial time
  const completedTime = TASKS.reduce((acc, task) => acc + task.completed, 0);
  const diffHours = completedTime + relativeTime.startFloor;

  useEffect(() => {
    return;
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    // Start counting only at round minutes (XX:05, XX:10, ...)
    if (currentTime - 1 < startTimeAbsoluteCeil + TASKS[currentTask].startAt) {
      return;
    }
    if (currentTime % 5 === 0) {
      setSliderValue((p) => p + 5);
      setCurrentTaskProgress((p) => p + 5);
    }
    if (currentTime === startTimeAbsoluteCeil + durationExact || isSliderMoving.current) {
      clearInterval(timerRef.current);
    }
  }, [currentTime]);

  useEffect(() => {
    if (currentTaskProgress === TASKS[currentTask].duration && currentTask < TASKS.length - 1) {
      setCurrentTask((p) => p + 1);
      setCurrentTaskProgress(0);
    }
  }, [currentTaskProgress, currentTask]);

  return (
    <div>
      <div>
        <h3>Start time: {formatHours(minutes)}</h3>
        <h3>Current time: {formatHours(currentTime)}</h3>
        <h3>Current task: {TASKS[currentTask].title}</h3>
        <h3>
          Current task timer:{" "}
          {formatHours(startTimeAbsoluteCeil + TASKS[currentTask].startAt + TASKS[currentTask].duration - currentTime)}
        </h3>
        <h3>
          Task progress: {formatHours(currentTaskProgress)} / {formatHours(TASKS[currentTask].duration)}
        </h3>
      </div>
      <Container offsetTop={diffHours}>
        {Array(24)
          .fill(null)
          .map(
            (_, hour) =>
              hour * 60 >= relativeTime.startFloor &&
              hour * 60 <= relativeTime.endCeil && (
                <div key={hour} className="hour">
                  <span>{formatHours(absoluteTime.startFloor + hour * 60)}</span>
                  <div className="hour-inside" />
                  <div className="hour-half" />
                </div>
              )
          )}
        <div className="hour">
          <span>XX:XX</span>
        </div>
        {TASKS.map((task, hour) => (
          <TaskStyled
            key={hour}
            top={relativeTime.startExact + task.startAt}
            completed={Math.round((task.completed / task.duration) * 100)}
            height={task.duration}
          // style={sliderValue >= relativeTime.startExact + task.startAt ? { backgroundColor: "#9DB599" } : {}}
          >
            <div className="task-title">{task.title} - {formatHours(relativeTime.startExact + task.startAt + task.completed)}</div>
          </TaskStyled>
        ))}
        <Slider
          height={durationFloorToCeil}
          type="range"
          min={0}
          max={durationFloorToCeil}
          step={5}
          value={sliderValue}
          onChange={(e) => {
            isSliderMoving.current = true;
            setSliderValue(parseInt(e.target.value));
            const newValue = parseInt(e.target.value);
            TASKS.forEach((task, idx) => {
              if (newValue >= relativeTime.startExact + task.startAt) {
                setCurrentTask(idx);
                setCurrentTaskProgress(newValue - relativeTime.startExact - task.startAt);
              }
            });
          }}
          onMouseUp={() => {
            isSliderMoving.current = false;
          }}
        />
        <SliderMark top={sliderValue}>
          <SliderMarkHour>
            {/* {formatHours(currentTaskProgress)} / {formatHours(TASKS[currentTask].duration)} */}
            {formatHours(sliderValue + diffHours)}
          </SliderMarkHour>
        </SliderMark>
      </Container>
    </div>
  );
}

const Container = styled.div<{ offsetTop: number }>`
  position: relative;
  margin-top: 20px;
  margin-right: 150px;
  padding-top: ${(p) => p.offsetTop}px;

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
`;

type TaskStyledProps = {
  top: number;
  height: number;
  completed: number;
};
const TaskStyled = styled.div<TaskStyledProps>`
  position: absolute;
  height: ${(p) => p.height - 1}px;
  top: ${(p) => p.top}px;
  left: 80px;
  width: calc(100% - 80px);
  // background-color: #94c98b;
  border-radius: 8px;
  background: linear-gradient(
    to bottom,
    #9DB599 0% ${p => p.completed}%,
    #94c98b ${p => p.completed}% 100%
  );
`;

const Slider = styled.input<{ height: number }>`
  position: absolute;
  transform: rotate(90deg);
  top: ${(p) => p.height / 2 - 8}px;
  left: calc(100% - ${(p) => p.height / 2}px + 10px);
  width: calc(${(p) => p.height}px + 8px + 8px);
  -webkit-appearance: none;
  background: transparent;
  z-index: 2;
`;

const SliderMark = styled.div<{ top: number }>`
  position: absolute;
  width: calc(100% - 60px);
  top: ${(p) => p.top}px;
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
