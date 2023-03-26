import styled from "styled-components";
import {
  eventsById as eventsData,
  calendarById,
  Event2,
} from "../assets/events";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useImmer } from "use-immer";
import dayjs from "dayjs";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type EventsContextProps = {
  getEvent: (id: string) => Event2;
  getDayEvents: (day: string) => string[];
  changeEventDate: (id: string, fromDate: string, toDate: string) => void;
};

const EventsContext = createContext({} as EventsContextProps);

function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useImmer(eventsData);
  const [calendar, setCalendar] = useImmer(calendarById);

  const getEvent = useCallback((id: string) => events[id], [events]);

  const getDayEvents = useCallback(
    (day: string) => calendar[day] || [],
    [calendar]
  );

  const changeEventDate = useCallback(
    (id: string, fromDate: string, toDate: string) => {
      // setCalendar((prevCalendar) => {
      //   const newCalendar = { ...prevCalendar };
      //   // Remove event from old date
      //   newCalendar[fromDate] = newCalendar[fromDate].filter(
      //     (eventId) => eventId !== id
      //   );
      //   // Add event to new date
      //   newCalendar[toDate] = [...(newCalendar[toDate] || []), id];
      //   return newCalendar;
      // });
      // setCalendar((draft) => {
      //   // Remove event from old date
      //   draft[fromDate] = draft[fromDate].filter((eventId) => eventId !== id);
      //   // Add event to new date
      //   (draft[toDate] ||= []).push(id);
      // });
    },
    []
  );

  return (
    <EventsContext.Provider value={{ getEvent, getDayEvents, changeEventDate }}>
      {children}
    </EventsContext.Provider>
  );
}

function useEvents() {
  return useContext(EventsContext);
}

type Event = {
  title: string;
  date: string;
};

type Day = {
  day: number;
  date: string;
  events: Event[];
};

export function CalendarDnD() {
  return (
    <DndProvider backend={HTML5Backend}>
      <EventsProvider>
        <Calendar />
      </EventsProvider>
    </DndProvider>
  );
}

function Calendar() {
  const calendar = useMemo(() => generateCalendarCells(), []);

  return (
    <Container>
      <table>
        <tbody>
          {calendar.map((week, i) => (
            <tr key={i} style={{ display: "flex" }}>
              {week.map((day, j) => (
                <td key={j}>
                  <DayHolder day={day} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}

function DayHolder({ day }: { day: Day }) {
  const { getDayEvents, changeEventDate } = useEvents();
  const [eventsForDay, setEvents] = useImmer(() => getDayEvents(day.date));
  // const eventsForDay = useMemo(
  //   () => getDayEvents(day.date),
  //   [getDayEvents, day.date]
  // );

  function removeEvent(index: number) {
    setEvents((draft) => {
      draft.splice(index, 1);
    });
  }

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "event",
      drop: (item: any) => {
        if (item.fromDate !== day.date) {
          setEvents((draft) => {
            draft.push(item.id);
          });
          // changeEventDate(item.id, item.fromDate, day.date);
        }
      },
      canDrop(item) {
        return item.fromDate !== day.date;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    []
  );

  const backgroundColor = isOver && canDrop ? "lightgreen" : "white";

  return (
    <DayStyled ref={drop} style={{ backgroundColor }}>
      <span>{day.day}</span>
      {eventsForDay.map((eventId, i) => (
        <EventHolder
          key={eventId}
          id={eventId}
          date={day.date}
          index={i}
          removeEvent={removeEvent}
        />
      ))}
    </DayStyled>
  );
}

const EventHolder = memo(function EventHolder({
  id,
  date,
  index,
  removeEvent,
}: {
  id: string;
  date: string;
  index: number;
  removeEvent: (index: number) => void;
}) {
  const { getEvent } = useEvents();

  const { title } = useMemo(() => getEvent(id), [getEvent, id]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "event",
    item: { id, title, index, fromDate: date },
    // end(draggedItem, monitor) {
    //   if (monitor.didDrop()) {
    //     removeEvent(index);
    //   }
    // },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      test: true,
    }),
  }));

  return (
    <EventStyled
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {title}
    </EventStyled>
  );
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
`;

const EventStyled = styled.div`
  display: flex;
  padding: 2px 4px;
  background-color: lightblue;
  border-radius: 4px;
  margin-bottom: 4px;

  &:hover {
    cursor: grab;
    background-color: lightgreen;
  }
`;

const DayStyled = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 120px;
  min-height: 100px;
  border: 1px solid black;
`;

const CalendarStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
`;

const DAYS_IN_A_WEEK = 7;

export function generateCalendarCells(): Day[][] {
  const today = dayjs();
  const year = today.year();
  const month = today.month();
  const daysInMonth = today.daysInMonth();
  const startOfMonthInWeek = today.startOf("month").day();
  const endOfMonthInWeek = today.endOf("month").day();

  const firstWeek = Array(startOfMonthInWeek - 1)
    .fill(null)
    .map((day) => ({
      day: 0,
      date: "2022-00-00",
      events: [],
    }));
  const lastWeek = Array(DAYS_IN_A_WEEK - endOfMonthInWeek)
    .fill(null)
    .map((day) => ({
      day: 0,
      date: "2022-00-00",
      events: [],
    }));
  const monthDays = Array(daysInMonth)
    .fill(null)
    .map((_, i) => ({
      day: i + 1,
      date: `${year}-${addZeroIfNeeded(month + 1)}-${addZeroIfNeeded(i + 1)}`,
      events: [],
    }));

  const wholeMonth = firstWeek.concat(monthDays).concat(lastWeek);
  return Array(Math.ceil(wholeMonth.length / DAYS_IN_A_WEEK))
    .fill(null)
    .map((_, i) =>
      wholeMonth.slice(i * DAYS_IN_A_WEEK, (i + 1) * DAYS_IN_A_WEEK)
    );
}

function addZeroIfNeeded(number: number): string {
  return (number < 10 ? "0" : "") + number;
}

export function formatHours(minutes: number): string {
  const m = minutes % 60;
  const h = (minutes - m) / 60;

  // if (h === 0) return m.toString() + 'm'
  // if (m === 0) return h.toString() + 'h'
  return `${addZeroIfNeeded(h)}:${addZeroIfNeeded(m)}`;
}

export function fromArrayToObject<T extends {}>(
  arr: T[],
  key: keyof T
): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    (acc[String(item[key])] ??= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function toById<T extends { id: string }>(array: T[]) {
  return fromArrayToObject(array, "id");
}

export function toByField<T extends { [key: string]: string }>(
  array: T[],
  field: string
) {
  return fromArrayToObject(array, field);
}
