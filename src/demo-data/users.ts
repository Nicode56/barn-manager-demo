export const demoUsers = {
  manager: { name: "Mia", role: "manager", horses: [1, 2] },
  staff: { name: "Sam", role: "staff", horses: [1] },
  // clientId 3 = "Ava Brooks" in demo-data/clients.ts, the owner this demo
  // persona represents (owns animals with ownerId 3: Juniper and Maple).
  client: { name: "Ava", role: "client", horses: [2], clientId: 3 },
};
