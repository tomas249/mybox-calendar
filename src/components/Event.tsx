import styled from "styled-components";

type EventProps = {
	title: string;
	description?: string;
	subject?: string;
	timeDedicated?: number;
}

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