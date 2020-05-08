export default (data) => ({
	tagName: "div",
	style: "cursor: pointer",
	textContent: `${data.irc.getUserPrefix(data.user, data.channel)}${data.user.nickname}`
})
