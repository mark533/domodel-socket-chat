export default data => ({
	tagName: "div",
	textContent: `[${new Date(data.time).toLocaleTimeString('en-US', { hour12: false })}] ${data.source} ${data.message}`
})
