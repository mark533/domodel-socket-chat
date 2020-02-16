import COMMANDS from '../data/commands.js'

export const PREFIX_COMMAND = "/"

export default class CommandProcessor {

	constructor(irc) {
		this.irc = irc
	}

	get irc() { return this._irc }
	set irc(irc) { this._irc = irc }

	run(str) {
		const tokens = str.trim().substr(1).split(' ')
		const name = tokens[0].toLowerCase()
		let args = []
		if (tokens.length > 1) {
			args = tokens.slice(1)
		}
		for (const item of COMMANDS) {
			const itemTokens = item.command.split(' ')
			const itemName = itemTokens[0].toLowerCase()
			let itemArgs = []
			if (itemTokens.length > 1) {
				itemArgs = itemTokens.slice(1)
			}
			const itemData = {}
			if(itemName === name) {
				for (const [index, arg] of itemArgs.entries()) {
					const optional = arg.substr(1, 1) === "?"
					let argName 
					if(optional === true) {
						argName = arg.substr(2, arg.length - 3) 
					} else {
						argName = arg.substr(1, arg.length - 2) 
					}
					if (index + 1 > args.length && optional === false) {
						this.irc.emit("irc message", `Missing args, syntax is : ${item.command}`)
						return
					} else {
						itemData[argName] = args[index]
					}
				}
				const eventArgs = { ...item.args, ...itemData }
				const keys = Object.keys(eventArgs)
				if(keys.length === 0) {
					this.irc.emit(item.event)
				} else if (keys.length === 1) {
					this.irc.emit(item.event, eventArgs[keys[0]])
				} else {
					this.irc.emit(item.event, eventArgs)
				}
				return
			}
		}
		this.irc.emit("irc message", `Command not found`)
	}
}