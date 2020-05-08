export const STATE_SEARCHING = "STATE_SEARCHING"
export const STATE_FOUND_TOKEN = "STATE_FOUND_TOKEN"

export const PREFIXES = {
	"#": "hashtag",
	"@": "mention",
}

export const tokenize =	function(text) {
	const characters = [...text]
	let state = STATE_SEARCHING
	const tokens = []
	let token = {
		buffer: "",
		bufferIndex: null
	}
	const prefixesKeys = Object.keys(PREFIXES)
	for(const [index, character] of characters.entries()) {
		if(state === STATE_SEARCHING && prefixesKeys.includes(character) && (((index === characters.length - 1 || prefixesKeys.includes(characters[index + 1]) === false) && (index === 0 || prefixesKeys.includes(characters[index - 1]) === false)))) {
			if(token.bufferIndex !== null) {
				tokens.push(token)
				token = {
					buffer: "",
					bufferIndex: null
				}
			}
			state = STATE_FOUND_TOKEN
			token.type = PREFIXES[character]
			token.bufferIndex = index
			token.buffer += character
		} else if(state === STATE_FOUND_TOKEN && (prefixesKeys.includes(character) || character === " " || character === "\n" || index === characters.length - 1)) {
			if(index === characters.length - 1) {
				token.buffer += character
			}
			state = STATE_SEARCHING
			if(token.buffer.length === 1) {
				token.type = "text"
			}
			tokens.push(token)
			token = {
				buffer: "",
				bufferIndex: null
			}
			if(character === " " || character === "\n") {
				token.bufferIndex = index
				token.buffer = character
			}
		} else if(state === STATE_FOUND_TOKEN) {
			token.buffer += character
		} else {
			if(token.bufferIndex === null) {
				token.bufferIndex = index
			}
			token.buffer += character
		}
		if(index === characters.length - 1 && token.bufferIndex !== null) {
			tokens.push(token)
		}
	}
	return tokens
}

export const replace = function(irc, text) {
	const tokens = tokenize(text)
	const message = {
		tagName: "span",
		children: []
	}
	for (const [index, token] of tokens.entries()) {
		if(token.type === "hashtag") {
			message.children.push({
				tagName: "a",
				href: "javascript:;",
				onclick: () => irc.emit("channel join", token.buffer),
				textContent: token.buffer
			})
		} else if(token.type === "mention") {
			message.children.push({
				tagName: "a",
				href: "javascript:;",
				onclick: () => irc.emit("input", { value: `/MSG ${token.buffer.substring(1)} `, focus: true}),
				textContent: token.buffer
			})
		} else {
			message.children.push({
				tagName: "span",
				textContent: token.buffer
			})
		}
	}
	return message
}