import { DOModel, Binding } from '../../lib/domodel/index.js'

import ChannelTabBinding from './channel-tab.js'
import ChannelTabModel from '../model/channel-tab.js'

import { PREFIX_CHANNEL } from '../object/irc.js'

import {socket} from './irc.js'


export default class extends Binding {

	async onCreated() {
		const { irc } = this.props
		irc.listen("channel list", function (query) {
			socket.emit('channel list', query);
		})
		socket.on("channel list", channels => {
			irc.emit("irc message", channels.map(channel => channel.name).join(", "))
		});
		irc.listen("channel topic", function (topic) {
			socket.emit('channel topic', {topic, name: irc.channel.name});
		})
		irc.listen("channel set", function (channel) {
			irc.channel = channel
		})
		irc.listen("channel join", name => {
			const channel = irc.channels.find(item => item.name === name)
			if (typeof channel === "undefined") {
				socket.emit("channel join", name)
			} else if(channel.disconnected === true) {
				socket.emit("channel reconnect", name)
			} else {
				irc.emit("channel set", channel)
			}
		})
		socket.on("channel join", data => {
			const { channel, users, nickname} = data
			irc.user.nickname = nickname
			irc.users = users
			irc.channel = channel
			irc.channels.push(irc.channel)
			DOModel.run(ChannelTabModel(channel), { parentNode: this.root, binding: new ChannelTabBinding({ irc, channel}) })
			irc.emit("channel set", channel)
		})
		socket.on("channel reconnect", data => {
			const { channel, users, nickname } = data
			irc.user.nickname = nickname
			irc.users = users
			let index = irc.channels.findIndex(ch => ch.name === channel.name)
			irc.channels[index].users = channel.users
			irc.channels[index].owner = channel.owner
			irc.channels[index].topic = channel.topic
			irc.channels[index].disconnected = false
			irc.channel = irc.channels[index]
			irc.emit("channel reconnected", channel.name)
			irc.emit("channel set", irc.channels[index])
		})
		irc.listen("channel leave", name => {
			if(irc.channel.disconnected === true) {
				const index = irc.channels.findIndex(channel => channel.name === name)
				irc.channels.splice(index, 1)
				irc.emit("channel left", name)
				if (irc.channels.length >= 1) {
					irc.channel = irc.channels[0]
					irc.emit("channel set", irc.channels[0])
				} else {
					irc.channel = null
				}
			} else if(irc.channel === null) {
				irc.emit("irc message", "No channel joined. Try /join #<channel>")
			} else {
				socket.emit("channel leave", name)
			}
		})
		socket.on("channel leave", _channel => {
			const index = irc.channels.findIndex(channel => channel.name === _channel.name)
			irc.channels.splice(index, 1)
			irc.emit("channel left", _channel.name)
			if (irc.channels.length >= 1) {
				irc.channel = irc.channels[0]
				irc.emit("channel set", irc.channels[0])
			} else {
				irc.channel = null
			}
		})
		irc.listen("channel disconnect", (name = irc.channel.name) => {
			socket.emit("channel disconnect", name)
		})
		socket.on("channel disconnect", _channel => {
			irc.channel = null
			const channel = irc.channels.find(channel => channel.name === _channel.name)
			channel.disconnected = true
			irc.emit("channel disconnected", _channel.name)
		})
		irc.listen("channel delete", name => {
			socket.emit("channel delete", name)
		})
		irc.listen("user message", data => {
			const { nickname, message } = data
			if (irc.channel === null) {
				irc.emit("irc message", "No channel joined. Try /join #<channel>")
			} else {
				socket.emit("user message", {nickname, message, channelName: irc.channel.name})
			}
		})
	}

}