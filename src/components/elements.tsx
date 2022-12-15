type TaskProps = {
  title: string;
  duration: number;
  completedTime?: number;
}

class Task {
  title: string;
  duration: number;
  completedTime: number;
  start: number = 0;
  end: number = 0;

  constructor({ title, duration, completedTime = 0}: TaskProps) {
    this.title = title;
    this.duration = duration;
    this.completedTime = completedTime;
  }
}

export class TasksList {
  tasks: Task[];
  totalDuration: number = 0;
  completedTime: number = 0;
  notCompletedTime: number = 0;

  constructor(tasksList: TaskProps[]) {
    this.tasks = tasksList.map((task) => new Task(task));
    this.calculateStartAndEndTimes();
  }

  calculateStartAndEndTimes() {
    let time = 0;
    let completedTime = 0;
    this.tasks.forEach((task) => {
      task.start = time;
      time += task.duration;
      task.end = time;
      completedTime += task.completedTime;
    });
    this.totalDuration = time;
    this.completedTime = completedTime;
    this.notCompletedTime = this.totalDuration - this.completedTime;
  }

  getTasks() {
    return this.tasks;
  }
}
