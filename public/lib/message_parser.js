export const STATE_SEARCHING = "STATE_SEARCHING"
export const STATE_TOKENIZING_HASHTAG = "STATE_TOKENIZING_HASHTAG"
export const STATE_TOKENIZING_MENTION = "STATE_TOKENIZING_MENTION"

export const PREFIX_CHANNEL = "#"
export const PREFIX_NICKNAME = "@"

export const tokenize =	function(text) {
	const characters = [...text]
	let state = STATE_SEARCHING
	const tokens = []
	let token = {
		buffer: "",
		bufferIndex: null
	}
	for(const [index, character] of characters.entries()) {
		if(state === STATE_SEARCHING && character === PREFIX_CHANNEL) {
			state = STATE_TOKENIZING_HASHTAG
			token.bufferIndex = index
			token.buffer += character
		} else if(state === STATE_SEARCHING && character === PREFIX_NICKNAME) {
			state = STATE_TOKENIZING_MENTION
			token.bufferIndex = index
			token.buffer += character
		} else if(state === STATE_TOKENIZING_HASHTAG && (character === PREFIX_CHANNEL || character === " " || character === "\n" || index === characters.length - 1)
			|| state === STATE_TOKENIZING_MENTION  && (character === PREFIX_NICKNAME || character === " " || character === "\n" || index === characters.length - 1)) {
			if(index === characters.length - 1) {
				token.buffer += character
			}
			state = STATE_SEARCHING
			tokens.push(token)
			token = {
				buffer: "",
				bufferIndex: null
			}
		} else if(state === STATE_TOKENIZING_HASHTAG || state === STATE_TOKENIZING_MENTION) {
			token.buffer += character
		}
	}
	return tokens
}
	
export const parse =	function(text) {
	const tree = {
		hashtags: [],
		mentions: []
	}

	const tokens = this.tokenize(text)

	for(const token of tokens) {
		if(token.buffer.substring(0, 1) === PREFIX_CHANNEL) {
			token.buffer = token.buffer.substring(1)
			tree.hashtags.push(token)
		} else if(token.buffer.substring(0, 1) === PREFIX_NICKNAME) {
			token.buffer = token.buffer.substring(1)
			tree.mentions.push(token)
		}
	}
	return tree
}

export const replace = function(text) {
	const tokens = tokenize(text)
	for (const [index, token] of tokens.entries()) {
		let replacement
		if (token.buffer.substring(0, 1) === "#") {
			replacement = "<a href='##" + token.buffer.substring(1) + "'>" + token.buffer + "</a>"
			// replacement = "<a href='/hashtag/" + token.buffer.substring(1) + "'>" + token.buffer + "</a>"
		} else if (token.buffer.substring(0, 1) === "@") {
			replacement = "<a href='#@" + token.buffer.substring(1) + "'>" + token.buffer + "</a>"
			// replacement = "<a href='/profile/" + token.buffer.substring(1) + "'>" + token.buffer + "</a>"
		}
		const diff = replacement.length - token.buffer.length
		text = text.substring(0, token.bufferIndex) + replacement + text.substring(token.bufferIndex + token.buffer.length)
		for (let i = index; i < tokens.length; i++) {
			tokens[i].bufferIndex += diff
		}
	}
	return text
}
