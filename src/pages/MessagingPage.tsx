import React from "react";

export const MessagingPage: React.FC = () => {
  // Mock conversation threads
  const conversations = [
    {
      id: "c1",
      participant: "Mia",
      role: "Barn Manager",
      lastMessage: "Thanks for handling that farrier appointment!",
      timestamp: "2 hours ago",
      unread: true,
      preview: [
        {
          sender: "Sam",
          text: "I've completed the farrier service on Copper",
          time: "2 hours ago",
        },
        {
          sender: "Mia",
          text: "Thanks for handling that farrier appointment!",
          time: "2 hours ago",
        },
      ],
    },
    {
      id: "c2",
      participant: "Ava Brooks",
      role: "Client",
      lastMessage: "When is Willow available for her next lesson?",
      timestamp: "4 hours ago",
      unread: false,
      preview: [
        {
          sender: "Ava Brooks",
          text: "When is Willow available for her next lesson?",
          time: "4 hours ago",
        },
        {
          sender: "Mia",
          text: "We have a slot available on Thursday at 2:30 PM",
          time: "3 hours ago",
        },
        {
          sender: "Ava Brooks",
          text: "Perfect! I'll take that slot",
          time: "2 hours ago",
        },
      ],
    },
    {
      id: "c3",
      participant: "Farm Team",
      role: "Group",
      lastMessage: "Remember to check feed levels daily",
      timestamp: "1 day ago",
      unread: false,
      preview: [
        {
          sender: "Mia",
          text: "Team reminder: Remember to check feed levels daily",
          time: "1 day ago",
        },
        {
          sender: "Sam",
          text: "Will do! Also restocking hay tomorrow",
          time: "1 day ago",
        },
      ],
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 page-title-banner">Direct Messaging</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="col-span-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-gray-100 p-4 border-b border-gray-200">
            <p className="font-semibold">Conversations</p>
          </div>
          <div className="divide-y">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                  conv.unread ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{conv.participant}</p>
                    <p className="text-xs text-gray-500">{conv.role}</p>
                  </div>
                  {conv.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {conv.lastMessage}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Message Display */}
        <div className="col-span-2 border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col">
          {/* Header */}
          <div className="bg-gray-100 p-4 border-b border-gray-200">
            <p className="font-semibold text-lg">Mia</p>
            <p className="text-xs text-gray-600">Barn Manager</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversations[0].preview.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "Mia" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === "Mia"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled
              />
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm opacity-50">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
