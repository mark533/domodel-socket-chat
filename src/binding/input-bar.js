import { Binding } from '../../lib/domodel/index.js'

import CommandProcessor, { PREFIX_COMMAND } from '../../lib/command-processor.js'

export default class extends Binding {

	async onCreated() {
		const { irc } = this.props
		const history = []
		let historyIndex = 0
		const commandProcessor = new CommandProcessor(irc)
		irc.listen("input", data => {
			const {value, focus, increment} = data
			if(increment === true) {
				this.identifier.input.value += value
			} else {
				this.identifier.input.value = value
			}
			if(focus === true) {
				this.identifier.input.focus()
			}
		})
		irc.listen("input focus", () => {
			this.identifier.input.focus()
		})
		irc.webSocket.on("channel join", data => {
			const { nickname } = data
			this.identifier.buttonNick.textContent = nickname
		})
		irc.webSocket.on("channel reconnect", data => {
			const { nickname } = data
			this.identifier.buttonNick.textContent = nickname
		})
		irc.webSocket.on("nickname set", nickname => {
			irc.user.nickname = nickname
			this.identifier.buttonNick.textContent = nickname
		});
		irc.listen("nickname set", nickname => {
			irc.webSocket.emit("nickname set", nickname)
		})
		this.identifier.input.addEventListener("keyup", event => {
			if (event.keyCode === 38 && historyIndex > 0) { // history previous
				historyIndex--
				this.identifier.input.value = history[historyIndex]
			} else if (event.keyCode === 40 && historyIndex < history.length - 1) { // history next
				historyIndex++
				this.identifier.input.value = history[historyIndex]
			}
			else if (event.keyCode === 13) {
				const { value } = this.identifier.input
				if (value.length === 0) {
					return
				}
				history.push(value)
				historyIndex = history.length
				this.identifier.input.value = ""
				if (value.substr(0, 1) === PREFIX_COMMAND) {
					commandProcessor.run(value)
				} else {
					if (irc.webSocket.connected === false) {
						irc.emit("irc message", "Your are not connected to the network. Try /connect" )
					} else if (irc.channel === null) {
						irc.emit("irc message", "No channel joined. Try /join #<channel>")
					} else {
						irc.emit("message send", { source: irc.user.nickname, message: value })
					}
				}
			}
		})
		this.identifier.buttonNick.addEventListener("click", () => {
			this.identifier.popup.style.display = "grid"
			this.identifier.input_nick.value = irc.user.nickname
			this.identifier.input_nick.focus()
		})
		this.identifier.popup.addEventListener("click", () => {
			if(event.target.contains(this.identifier.popup) === true) {
				this.identifier.popup.style.display = "none"
			}
		})
		this.identifier.input_nick.addEventListener("keypress", (event) => {
			if (event.keyCode === 13) {
				this.identifier.popup.style.display = "none"
				irc.emit("nickname set", this.identifier.input_nick.value)
			}
		})
		window.addEventListener("keyup", event => {
			if (event.keyCode === 27) {
				this.identifier.popup.style.display = "none"
			}
		})
		window.addEventListener("click", event => {
			if(event.target.contains(this.identifier.emojiButton) === false) {
				this.identifier.submenu.style.display = "none"
			}
		})
		this.identifier.emojiButton.addEventListener("click", () => {
			if(this.identifier.submenu.style.display === "none") {
				this.identifier.submenu.style.display = "grid"
			} else {
				this.identifier.submenu.style.display = "none"
			}
		})
	}

}