type Event = {
  title: string;
  date: string;
}
export const events: Event[] = [{
  "title": "All Day Event",
  "date": "2023-03-01"
}, {
  "title": "Long Event",
  "date": "2023-03-07",
}, {
  "title": "Repeating Event",
  "date": "2023-03-07"
}, {
  "title": "Repeating Event",
  "date": "2023-03-16"
}, {
  "title": "Conference",
  "date": "2023-03-25",
}, {
  "title": "Meeting",
  "date": "2023-03-24",
}, {
  "title": "Lunch",
  "date": "2023-03-24"
}, {
  "title": "Birthday Party",
  "date": "2023-03-25"
}, {
  "title": "Click for Google",
  "date": "2023-03-28"
}, {
  "title": "Meeting",
  "date": "2023-03-24"
}, {
  "title": "Happy Hour",
  "date": "2023-03-24"
}, {
  "title": "Dinner",
  "date": "2023-03-24"
}]

export type Event2 = {
  id: string
  title: string,
  tasks: {
    title: string
    duration: number
  }[]
}

export const eventsById: Record<string, Event2> = {
  // Generate 10000 move events
  ...Array.from({ length: 100 }, (_, i) => i).reduce((acc, i) => {
    acc[`event${i}`] = {
      id: `event${i}`,
      title: `Event ${i}`,
      tasks: [{ title: 'subtask1', duration: 60 }, { title: 'subtask2', duration: 140 }]
    }
    return acc
  }
    , {} as Record<string, Event2>)
}

const min = 1
const max = 31
const generateDate = (day: number) => `2023-03-${day < 10 ? '0' + day : day}`

const calendarDays = Array
  .from({ length: max - min + 1 }, (_, i) => i + min)
  .map(generateDate)
  .reduce((acc, day) => {
    acc[day] = []
    return acc
  }, {} as Record<string, string[]>)

// push randomly events to calendar days. Remember, to push only the ids of the events.
Object.entries(eventsById).forEach(([id, event]) => {
  const day = generateDate(Math.floor(Math.random() * (max - min + 1)) + min)
  calendarDays[day].push(id)
})

const t = Object.values(calendarDays).reduce((acc, day) => {
  return acc + day.length
}, 0)
console.log({t})

export const calendarById = calendarDays
