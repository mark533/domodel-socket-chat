export default {
	tagName: "div",
	id: "users-list",
	style: "display: none; grid-area: span 3 / 3; width: 200px; grid-template-rows: subgrid",
	children: [
		{
			tagName: "div",
			identifier: "counter",
			className: "border-width-1",
			style: "background-color: white; border-color: black; border-style: solid; text-align: center; grid-row: 1; overflow-x: scroll; white-space: nowrap; scrollbar-width: none",
		},
		{
			tagName: "div",
			style: "background-color: white; overflow: auto; grid-row-start: span 2; grid-row-end: auto;",
			identifier: "list"
		}
	]
}