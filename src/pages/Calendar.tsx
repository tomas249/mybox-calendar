import { useState } from "react"

function findMovedEvents(oldEvents: Event[], newEvents: Event[]) {
  const orderMap: Record<string, number> = {};
  const movedEvents: {
    id: string;
    prev: string | null;
    next: string | null;
    order: number;
  }[] = [];

  // Create a hash table to map event IDs to their original order
  oldEvents.forEach(event => {
    orderMap[event.id] = event.order;
  });

  // Find events that have moved and calculate their new order
  newEvents.forEach((event, index) => {
    const originalOrder = orderMap[event.id];
    const newOrder = index === 0 ? event.order :
      (event.order + newEvents[index - 1].order) / 2;

    if (originalOrder !== newOrder) {
      // This event has moved
      const prevEvent = index === 0 ? null : newEvents[index - 1];
      const nextEvent = index === newEvents.length - 1 ? null : newEvents[index + 1];
      movedEvents.push({
        id: event.id,
        prev: prevEvent ? prevEvent.id : null,
        next: nextEvent ? nextEvent.id : null,
        order: newOrder
      });
    }
  });

  return movedEvents;
}



export function Calendar() {
  const [events, setEvents] = useState(EVENTS.map(e => ({ ...e })))

  function calculateOrder() {
    console.log({
      oldEvents: EVENTS,
      newEvents: events
    })
    const movedEvents = findMovedEvents(EVENTS, events);
    console.log(movedEvents);
  }

  return (
    <div className="flex flex-col w-screen h-screen text-white p-10">
      <div>
        <button onClick={calculateOrder}>Calculate order</button>
      </div>
      {events.map((event, index) => (
        <div key={event.id} className="flex items-center">
          <div className="flex items-center">
            <div className="text-2xl">{event.name}</div>
            <div className="text-2xl">{event.order}</div>
          </div>
          <div className="flex items-center">
            <button
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
              onClick={(() => {
                setEvents((events) => {
                  if (index === 0) {
                    return events
                  }

                  // const newIndex = index + 1

                  const newEvents = events.filter((e) => e.id !== event.id)
                  // const prevOrder = events[newIndex].order
                  // const nextOrder = events[newIndex + 1]?.order || events[newIndex].order + 10
                  // const newEvent = {
                  //   ...event,
                  //   order: (prevOrder + nextOrder) / 2
                  // }
                  // newEvents.splice(index + 1, 0, newEvent)
                  newEvents.splice(index - 1, 0, event)

                  return newEvents
                })
              })}
            >
              up
            </button>
            <button
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setEvents((events) => {
                  if (index === events.length - 1) {
                    return events
                  }

                  // const newIndex = index + 1

                  const newEvents = events.filter((e) => e.id !== event.id)
                  // const prevOrder = events[newIndex].order
                  // const nextOrder = events[newIndex + 1]?.order || events[newIndex].order + 10
                  // const newEvent = {
                  //   ...event,
                  //   order: (prevOrder + nextOrder) / 2
                  // }
                  // newEvents.splice(index + 1, 0, newEvent)
                  newEvents.splice(index + 1, 0, event)

                  return newEvents
                })
              }}
            >
              down
            </button>
            </div>
            </div>
      ))}
    </div>
  )
}


type Event = {
  id: string
  name: string
  order: number
}

const EVENTS: Event[] = [
	{
  	id: '111',
  	name: "Event one",
    order: 10
  },
  {
  	id: '222',
  	name: "Event two",
    order: 20
  },
  {
  	id: '333',
  	name: "Event three",
    order: 30
  },
  {
  	id: '444',
  	name: "Event four",
    order: 40
  }
]
