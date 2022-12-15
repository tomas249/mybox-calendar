import React, {useState, useEffect, useMemo} from 'react';
import styled from "styled-components";
import dayjs from "dayjs";

type Event = {
	id: string;
	date: string;
	title?: string;
	description?: string;
	type?: string;
	group?: string;
	dedicatedTime?: number;
	order: number;
}

type Day = {
	day: number;
	date: string;
	events: Event[];
}

type EventsGroupedByDate = { [key: string]: Event[] }

const eventsDB: Event[] = [
	{
		id: "11111",
		date: "2022-10-13",
		title: "First event",
		type: "task",
		group: "Captura i preparacio de dades",
		dedicatedTime: 156,
		order: 2
	},
	{
		id: "2222",
		date: "2022-10-13",
		title: "Second event",
		type: "pac",
		group: "Minera de dades",
		dedicatedTime: 20,
		order: 1
	},
	{
		id: "3333",
		date: "2022-10-15",
		title: "Third event",
		type: "task",
		group: "mates",
		dedicatedTime: 256,
		order: 1
	}
]

const eventsInit = eventsDB.reduce((events, event) => {
	events[event.date] = (events[event.date] || []).concat(event)
	return events
}, {} as { [key: string]: Event[] })

const emptyEvent = {
	id: 'empty-event',
	date: '',
	title: '',
	type: '',
	group: '',
	dedicatedTime: 0,
	isNew: true,
	isModified: false,
	order: -1
}

const EVENTS = 'events'
const TYPES = 'types'
const GROUPS = 'groups'

type ModifiedEvent = Event & { isNew?: boolean, isModified?: boolean }

function App() {
	const [events, setEvents] = useState<EventsGroupedByDate>({})
	const [selectedDate, setSelectedDate] = useState<Day>({
		day: 1,
		date: "2022-10-1",
		events: []
	})
	const [selectedEvent, modifySelectedEvent] = useState<ModifiedEvent>(emptyEvent)
	const dedicatedTimeByGroup = useMemo(() => {
		return Object.values(events).reduce((total, eventsArr) => {
			eventsArr.forEach(event => {
				total[event.group || 'undefined'] = (total[event.group || 'undefined'] || 0) + (event.dedicatedTime || 0)
			})
			return total
		}, {} as { [key: string]: number })
	}, [events])

	// Load initial events
	useEffect(() => {
		const localEvents = localStorage.getItem(EVENTS)
		if (localEvents) {
			try {
				setEvents(JSON.parse(localEvents))
			} catch (error) {
				console.error('Failed parsing local events')
				localStorage.removeItem(EVENTS)
			}
		}
	}, [])

	// Save locally events
	function saveLocally(newEvents: EventsGroupedByDate) {
		try {
			localStorage.setItem(EVENTS, JSON.stringify(newEvents))
		} catch (error) {
			console.error('Failed saving local events')
		}
	}

	function setSelectedEvent(newState: ModifiedEvent | ((prevState: ModifiedEvent) => ModifiedEvent), cell: Day = selectedDate) {
		if (typeof newState === 'function') {
			modifySelectedEvent(prev => {
				const updatedState = newState(prev)
				return {
					...updatedState,
					order: updatedState.isNew && updatedState.order === selectedEvent.order ? events[cell.date]?.length + 1 || 1 : updatedState.order
				}
			})
		} else {
			modifySelectedEvent({
				...newState,
				order: newState.isNew && newState.order === selectedEvent.order ? events[cell.date]?.length + 1 || 1 : newState.order
			})
		}
	}

	function changeSelectedEvent(name: string, value: unknown) {
		if (['dedicatedTime', 'order'].includes(name) && typeof value === 'string') {
			value = parseInt(value)
		}
		setSelectedEvent(prev => ({
			...prev,
			[name]: value,
			isModified: true
		}))
	}

	function onChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
		const {name, value} = event.target
		changeSelectedEvent(name, value)
	}

	return (
		<ContainerStyled>
			<GridContainerStyled>
				{generateCalendarCells().map((cell, index) => (
					<ItemStyled key={index} onClick={(event) => {
						setSelectedDate(cell)
						if (event.target === event.currentTarget) {
							setSelectedEvent(selectedEvent.isNew ? selectedEvent : emptyEvent, cell)
						}
					}}>
						<div className="header">{cell.day}{cell.date === selectedDate.date ? '*' : ''}</div>
						{events[cell.date]?.sort((a, b) => a.order - b.order).map((event, idx, sortedEvents) => (
							<EventStyled key={event.id}
							             onClick={() => setSelectedEvent(event.id === selectedEvent.id ? emptyEvent : event)}
							             style={event.type === 'PAC' && sortedEvents[idx - 1]?.type !== 'PAC' ? {marginTop: 'auto'} : {}}
							>
								<div className="container">
									<div style={{display: 'flex'}}>
										<span className="info">{event.group}</span>
										<span className="info">{formatHours(event.dedicatedTime || 0)}</span>
										{event.id === selectedEvent.id && <span style={{fontSize: '.8rem'}}>*</span>}
										<span className="info" style={{marginLeft: 'auto'}}>{event.type}</span>
									</div>
									<span>{event.title}</span>
								</div>
								<button className="delete" onClick={e => {
									e.stopPropagation()
									setEvents(prevEvents => {
										const newEvents = ({
											...prevEvents,
											[cell.date]: prevEvents[cell.date]
												.filter(ev => ev.id !== event.id)
												.sort((a, b) => a.order - b.order)
												.map((e, idx) => ({...e, order: idx + 1}))
										})
										saveLocally(newEvents)
										return newEvents
									})
									// Clear event if was selected
									if (event.id === selectedEvent.id) {
										setSelectedEvent(emptyEvent)
									}
								}}>X
								</button>
							</EventStyled>
						))}
					</ItemStyled>
				))}
			</GridContainerStyled>
			<div>
				<AddEventContainerStyled>
					<h3>day {selectedDate.day}</h3>
					<input name="title" type="text" placeholder="title" value={selectedEvent.title} onChange={onChangeInput}/>
					<input name="type" type="text" placeholder="type" value={selectedEvent.type}
					       onChange={onChangeInput}/>
					<input name="group" type="text" placeholder="group" value={selectedEvent.group}
					       onChange={onChangeInput}/>
					<input name="dedicatedTime" type="number" placeholder="dedicated time"
					       value={selectedEvent.dedicatedTime?.toString() || ''}
					       onChange={onChangeInput}/>
					<input name="order" type="number" placeholder="order" value={selectedEvent.order?.toString() || ''}
					       onChange={onChangeInput}
					/>
					{/*	Actions*/}
					{selectedEvent.isNew ? (
						<>
							<button onClick={() => {
								const newEvent = {
									id: generateUID(),
									title: selectedEvent.title,
									type: selectedEvent.type,
									group: selectedEvent.group,
									dedicatedTime: selectedEvent.dedicatedTime,
									order: selectedEvent.order,
									date: selectedDate.date,
								}
								setEvents(prevEvents => {
									const prevEventsAtDate = prevEvents[newEvent.date]
										?.sort((a, b) => a.order - b.order) || []

									const firsts = prevEventsAtDate.slice(0, newEvent.order - 1) // -1 because starts counting at 1
									const lasts = prevEventsAtDate.slice(newEvent.order - 1).map(e => ({...e, order: e.order + 1}))
									const newOrderEventsAtDate = firsts.concat(newEvent).concat(lasts).map((e, idx) => ({
										...e,
										order: idx + 1
									})) // Normalize order

									const newEvents = ({
										...prevEvents,
										[newEvent.date]: newOrderEventsAtDate,
									})
									saveLocally(newEvents)
									return newEvents
								})
								setSelectedEvent(newEvent)
							}}>Add event
							</button>
						</>
					) : (
						<>
							<button onClick={() => {
								setEvents(prevEvents => {
									const prevEventsAtDate = prevEvents[selectedEvent.date]
										.sort((a, b) => a.order - b.order)
										.filter(e => e.id !== selectedEvent.id)
										.map((e, idx) => ({...e, order: idx + 1}))
									const firsts = prevEventsAtDate.slice(0, selectedEvent.order - 1) // -1 because starts counting at 1
									const lasts = prevEventsAtDate.slice(selectedEvent.order - 1).map(e => ({...e, order: e.order + 1}))
									const newOrderEventsAtDate = firsts.concat(selectedEvent).concat(lasts).map((e, idx) => ({
										...e,
										order: idx + 1
									})) // Normalize order

									const newEvents = ({
										...prevEvents,
										[selectedEvent.date]: newOrderEventsAtDate
									})
									saveLocally(newEvents)
									return newEvents
								})
							}}>Modify event ({selectedEvent.isModified ? 'unsaved' : 'saved'})
							</button>
							<button onClick={() => setSelectedEvent(emptyEvent)}>Unselect event</button>
						</>
					)}
				</AddEventContainerStyled>
				<AddEventContainerStyled style={{marginTop: '1rem'}}>
					<h3>Types</h3>
					{[
						'PAC',
						'study'
					].map((t, index) => (
						<RounderPill key={index} selected={t === selectedEvent.type}
						             onClick={() => changeSelectedEvent('type', t)}>{t}</RounderPill>
					))}
				</AddEventContainerStyled>
				<AddEventContainerStyled style={{marginTop: '1rem'}}>
					<h3>Groups</h3>
					{[
						'AU',
						'CiP de dades',
						'DiG de projectes',
						'PiS de les dades',
						'TEX',
						'V de dades'
					].map((g, index) => (
						<RounderPill key={index} selected={g === selectedEvent.group}
						             onClick={() => changeSelectedEvent('group', g)}>{g} ({formatHours(dedicatedTimeByGroup[g] || 0)})</RounderPill>
					))}
				</AddEventContainerStyled>
			</div>
		</ContainerStyled>
	);
}

export default App;

const ContainerStyled = styled.div`
  display: flex;
  padding: 2rem;
`

const GridContainerStyled = styled.div`
  height: min-content;
  display: grid;
  grid-template-columns: repeat(7, 150px);
  grid-auto-rows: minmax(120px, auto);
  column-gap: 10px;
  row-gap: 15px;
`

const ItemStyled = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #61dafb;
  //border: 1px solid green;
  //border-radius: .4rem;

  .header {
    padding-top: .2rem;
    display: flex;
    justify-content: center;
  }
`

const EventStyled = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  border-radius: .4rem;
  background-color: aquamarine;
  padding: .2rem .1rem;
  margin-top: .2rem;
  cursor: pointer;

  :last-child {
    margin-bottom: .2rem;
  }

  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: .8rem;

    .info {
      font-size: .6rem;
      margin-right: 0.2rem;
      border-radius: .4rem;
      background-color: #fda07e;
      padding: .1rem .2rem;
    }
  }

  :hover {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    background-color: #208c68;

    .delete {
      display: block;
    }
  }

  .delete {
    z-index: 2;
    cursor: pointer;
    display: none;
    position: absolute;
    top: 0;
    left: 100%;
    font-size: .6rem;
    border: none;
    background-color: #208c68;
    padding: 0 .6rem;
    height: 100%;
    border-top-right-radius: .4rem;
    border-bottom-right-radius: .4rem;

    :hover {
      background-color: rgb(196, 176, 176);
    }
  }

  // No select
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently */
`

const AddEventContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
  height: min-content;
  margin-left: 2rem;
  border: 2px solid black;
  border-radius: .4rem;
  padding: .8rem;

  > * {
    margin-top: .8rem;
  }
`

const RounderPill = styled.div<{ selected?: boolean }>`
  border-radius: .4rem;
  background-color: ${({selected = false}) => selected ? '#008f5f' : 'aquamarine'};
  padding: .2rem .4rem;
  font-size: .8rem;
  cursor: pointer;
`

const DAYS_IN_A_WEEK = 7

function addZeroIfNeeded(number: number): string {
	return (number < 10 ? '0' : '') + number
}

function generateCalendarCells(): Day[] {
	const today = dayjs()
	const year = today.year()
	const month = today.month()
	const daysInMonth = today.daysInMonth()
	const startOfMonthInWeek = today.startOf('month').day()
	const endOfMonthInWeek = today.endOf('month').day()


	const firstWeek = Array(startOfMonthInWeek - 1).fill(null).map(day => ({
		day: 0,
		date: '2022-00-00',
		events: []
	}))
	const lastWeek = Array(DAYS_IN_A_WEEK - endOfMonthInWeek).fill(null).map(day => ({
		day: 0,
		date: '2022-00-00',
		events: []
	}))
	const monthDays = Array(daysInMonth).fill(null).map((_, i) => ({
		day: i + 1,
		date: `${year}-${addZeroIfNeeded(month + 1)}-${addZeroIfNeeded(i + 1)}`,
		events: []
	}))

	return firstWeek.concat(monthDays).concat(lastWeek)
}

function fillEmptyCells<T>(days: T[]): T[] {
	const now = dayjs()
	const daysInMonth = now.daysInMonth()
	const startOfMonthInWeek = now.startOf('month').day()
	const endOfMonthInWeek = now.endOf('month').day()

	const firstWeek = Array(startOfMonthInWeek - 1).fill({
		events: [],
		name: 0
	})
	const lastWeek = Array(DAYS_IN_A_WEEK - endOfMonthInWeek).fill({
		events: [],
		name: 0
	})
	// const monthDays = Array(daysInMonth).fill(null).map((_, i) => i + 1)

	return firstWeek.concat(days).concat(lastWeek)
}

function generateUID() {
	return "id" + Math.random().toString(16).slice(2)
}

export function formatHours(minutes: number): string {
	const m = minutes % 60
	const h = (minutes - m) / 60

	// if (h === 0) return m.toString() + 'm'
	// if (m === 0) return h.toString() + 'h'
	return `${addZeroIfNeeded(h)}:${addZeroIfNeeded(m)}`
}