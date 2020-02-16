export default [
  {
    command: "join <name>",
    event: "channel join",
  },
  {
    command: "nick <nickname>",
    event: "nickname set",
  },
  {
    command: "list <?query>",
    event: "channel list",
  },
  {
    command: "users",
    event: "users list",
  },
  {
    command: "msg <nickname> <message>",
    event: "user message",
  },
  {
    command: "delete <name>",
    event: "channel delete",
  },
  {
    command: "topic <topic>",
    event: "channel topic",
  },
  {
    command: "part",
    event: "channel disconnect",
  },
  {
    command: "disconnect",
    event: "disconnect",
  },
  {
    command: "connect",
    event: "connect",
  },
  {
    command: "debug",
    event: "debug",
  }
]