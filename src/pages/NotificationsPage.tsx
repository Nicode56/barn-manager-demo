import React from "react";

export const NotificationsPage: React.FC = () => {
  const notifications = [
    {
      id: "n1",
      type: "appointment",
      title: "Vet appointment completed",
      description: "Dr. Ellis completed vet check on Copper",
      timestamp: "2 hours ago",
      icon: "🏥",
      read: false,
    },
    {
      id: "n2",
      type: "lesson",
      title: "Lesson scheduled",
      description: "Emma Davis booked a beginner flatwork lesson at 9:00 AM",
      timestamp: "4 hours ago",
      icon: "🏇",
      read: false,
    },
    {
      id: "n3",
      type: "feed",
      title: "Low feed alert",
      description: "Senior grain supply running low (2 bags remaining)",
      timestamp: "1 day ago",
      icon: "🌾",
      read: true,
    },
    {
      id: "n4",
      type: "maintenance",
      title: "Maintenance task completed",
      description: "Sam completed fence repair in pasture 2",
      timestamp: "1 day ago",
      icon: "🔧",
      read: true,
    },
    {
      id: "n5",
      type: "health",
      title: "Upcoming appointment",
      description: "Dental cleaning scheduled for Willow on July 1",
      timestamp: "2 days ago",
      icon: "🦷",
      read: true,
    },
    {
      id: "n6",
      type: "client",
      title: "New client message",
      description: "Ava Brooks asking about lesson availability",
      timestamp: "2 days ago",
      icon: "💬",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold page-title-banner">Notifications</h1>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Notification Categories */}
      <div className="space-y-6">
        {/* Unread Section */}
        {unreadCount > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 page-title-banner">New</h2>
            <div className="space-y-2">
              {notifications
                .filter((n) => !n.read)
                .map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-blue-50 border border-blue-200 p-4 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex gap-4">
                      <div className="text-2xl">{notif.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notif.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notif.timestamp}
                        </p>
                      </div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Read Section */}
        {notifications.filter((n) => n.read).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 page-title-banner">Recent</h2>
            <div className="space-y-2">
              {notifications
                .filter((n) => n.read)
                .map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex gap-4">
                      <div className="text-2xl">{notif.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notif.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notif.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
