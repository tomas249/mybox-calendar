import './App.css';

import React, {useState, useEffect} from 'react';
import styled from "styled-components";
import dayjs from "dayjs";

type Event = {
	title: string;
	description?: string;
	subject?: string;
	minutesRequired?: number;
}

const events: { [key: string]: Event } = {
	'11': {
		title: 'First event',
		description: 'example description',
		subject: 'task',
		minutesRequired: 174
	},
	'22': {
		title: 'Second event',
		description: 'example description',
		subject: 'task',
		minutesRequired: 96
	},
	'33': {
		title: 'third event',
		description: 'example descasdasdasdription',
		subject: 'task',
		minutesRequired: 12
	}
}

type Day = {
	events: string[],
	name: number
}

const days = Array(31).fill(null).reduce((acc, curr, idx) => {
	acc[`${idx + 1}/10`] = {
		events: [],
		name: idx + 1
	}
	return acc
}, {}) as { [key: string]: Day }
days['2/10'] = {
	name: 2,
	events: ['22', '33']
}
days['8/10'] = {
	events: ['11'],
	name: 8
}
const month10 = Array(31).fill(null).map((_, idx) => days[`${idx + 1}/10`])

function App() {
	const [selectedDate, setSelectedDate] = useState(2)
	const [selectedEvent, setSelectedEvent] = useState<null | string>(null)


	return (
		<ContainerStyled>
			<GridContainerStyled>
				{fillEmptyCells(month10).map((day, index) => (
					<ItemStyled key={index} onClick={() => {
						if (day.name !== selectedDate) {
							setSelectedDate(day.name)
							setSelectedEvent(null)
						}
					}}>
						<div className="header">{day.name}{day.name === selectedDate ? '*' : ''}</div>
						{day.events.map(eventId => (
							<EventStyled key={eventId}
							             onClick={(e) => {
								             e.stopPropagation()
								             setSelectedDate(day.name)
								             setSelectedEvent(eventId === selectedEvent ? null : eventId)
							             }}>
								{events[eventId].title}{eventId === selectedEvent ? '*' : ''}
							</EventStyled>
						))}
					</ItemStyled>
				))}
			</GridContainerStyled>
			<AddEventContainerStyled>
				<h3>selected: {selectedDate}</h3>
				<input type="text" placeholder="title" value={selectedEvent ? events[selectedEvent].title : ''}/>
				<input type="text" placeholder="description" value={selectedEvent ? events[selectedEvent].description : ''}/>
				<button>{selectedEvent ? 'modify event' : 'add event'}</button>
				{selectedEvent && (
					<button onClick={() => setSelectedEvent(null)}>unselect event</button>
				)}
			</AddEventContainerStyled>
		</ContainerStyled>
	);
}

export default App;

const ContainerStyled = styled.div`
  display: flex;
  padding: 2rem;
`

const GridContainerStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 150px);
  grid-auto-rows: minmax(120px, auto);
  column-gap: 10px;
  row-gap: 15px;
`

const ItemStyled = styled.div`
  background-color: #61dafb;
  border: 1px solid green;
  border-radius: .4rem;

  .header {
    padding-top: .2rem;
    display: flex;
    justify-content: center;
  }
`

const EventStyled = styled.div`
  border-radius: .4rem;
  background-color: aquamarine;
  padding: .2rem .1rem;
  margin-top: .2rem;
  cursor: pointer;

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

const DAYS_IN_A_WEEK = 7

function generateDateCells() {
	const now = dayjs()
	const daysInMonth = now.daysInMonth()
	const startOfMonthInWeek = now.startOf('month').day()
	const endOfMonthInWeek = now.endOf('month').day()

	const firstWeek = Array(startOfMonthInWeek - 1).fill('previous')
	const lastWeek = Array(DAYS_IN_A_WEEK - endOfMonthInWeek).fill('next')
	const monthDays = Array(daysInMonth).fill(null).map((_, i) => i + 1)

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