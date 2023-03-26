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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProps,
} from "react-beautiful-dnd";

export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

type EventsContextProps = {
  getEvent: (id: string) => Event2;
  getDayEvents: (day: string) => string[];
  changeEventDate: (
    id: string,
    source: { index: number; date: string },
    destination: { index: number; date: string }
  ) => void;
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
    (
      id: string,
      source: { index: number; date: string },
      destination: { index: number; date: string }
    ) => {
      // No destination
      if (!destination) {
        return;
      }

      // No change
      if (
        source.date === destination.date &&
        source.index === destination.index
      ) {
        return;
      }

      // Same date
      if (source.date === destination.date) {
        setCalendar((draft) => {
          const events = draft[source.date];
          const [removed] = events.splice(source.index, 1);
          events.splice(destination.index, 0, removed);
        });
        return;
      }

      // Different date
      setCalendar((draft) => {
        // Remove event from old date
        const [removed] = draft[source.date].splice(source.index, 1);
        // Add event to new date
        draft[destination.date].splice(destination.index, 0, removed);
      });
    },
    [setCalendar]
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
  events: Event2[];
};

export function CalendarDnD() {
  return (
    <EventsProvider>
      <Calendar />
    </EventsProvider>
  );
}

function Calendar() {
  const { getDayEvents, getEvent, changeEventDate } = useEvents();
  const calendar = useMemo(() => generateCalendarCells(), []);
  const calendarWithEvents = useMemo(() => {
    return calendar.map((week) => {
      return week.map((day) => ({
        ...day,
        events: getDayEvents(day.date).map((id) => getEvent(id)),
      }));
    });
  }, [calendar, getDayEvents, getEvent]);

  return (
    <Container>
      <DragDropContext
        onDragEnd={(result) => {
          // changeEventDate(
          //   result.draggableId,
          //   {
          //     index: result.source.index,
          //     date: result.source.droppableId,
          //   },
          //   {
          //     index: result.destination?.index || 0,
          //     date: result.destination?.droppableId || "",
          //   }
          // );
        }}
      >
        {/* Map each group */}
        {calendarWithEvents.map((week, i) => (
          <div
            key={"week" + i}
            id="week"
            style={{
              display: "flex",
              gap: "1rem",
              border: "1px solid black",
              padding: "1rem",
            }}
          >
            {/* Map each item in group */}
            {week.map((day, index) => (
              <DropMemo key={index} day={day} />
            ))}
          </div>
        ))}
      </DragDropContext>
    </Container>
  );
}

const DropMemo = memo(({ day }: { day: Day }) => (
  <StrictModeDroppable droppableId={day.date}>
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {/* Map each item in the group */}
        <WeekItem day={day} />
        {provided.placeholder}
      </div>
    )}
  </StrictModeDroppable>
));

const WeekItem = memo(function WeekItem({ day }: { day: Day }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid red",
      }}
    >
      {/* Map each item in the group */}
      <EventItem day={day} />
    </div>
  );
});

const EventItem = memo(function EventItem({ day }: { day: Day }) {
  return (
    <>
      <span>{day.day}</span>
      {day.events.map((event, index) => (
        <SingleItem key={event.id} event={event} index={index} />
      ))}
    </>
  );
});

const SingleItem = memo(function SingleItem({
  event,
  index,
}: {
  index: number;
  event: Event2;
}) {
  return (
    <Draggable key={event.id} draggableId={event.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div style={{ display: "flex" }}>
            <EventStyled>{event.title}</EventStyled>
          </div>
        </div>
      )}
    </Draggable>
  );
});

// function Calendar() {
//   const calendar = useMemo(() => generateCalendarCells(), []);

//   return (
//     <Container>
//       <table>
//         <tbody>
//           {calendar.map((week, i) => (
//             <tr key={i} style={{ display: "flex" }}>
//               {week.map((day, j) => (
//                 <td
//                   key={j}
//                   style={{ display: "flex", flexDirection: "column" }}
//                 >
//                   <DayHolder day={day} />
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </Container>
//   );
// }

function DayHolder({ day }: { day: Day }) {
  const { getDayEvents, changeEventDate } = useEvents();

  const eventsForDay = useMemo(
    () => getDayEvents(day.date),
    [getDayEvents, day.date]
  );

  const backgroundColor = false ? "lightgreen" : "white";

  return (
    <DayStyled style={{ backgroundColor }}>
      <span>{day.day}</span>
      {eventsForDay.map((eventId, i) => (
        <EventHolder key={eventId} id={eventId} date={day.date} index={i} />
      ))}
    </DayStyled>
  );
}

const EventHolder = memo(function EventHolder({
  id,
  date,
  index,
}: {
  id: string;
  date: string;
  index: number;
}) {
  const { getEvent } = useEvents();
  const { title } = useMemo(() => getEvent(id), [getEvent, id]);

  const opacity = false ? 0.5 : 1;

  return <EventStyled style={{ opacity }}>{title}</EventStyled>;
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
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
  flex-grow: 1;
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
