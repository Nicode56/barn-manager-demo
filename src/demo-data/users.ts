export const demoUsers = {
  manager: { name: "Mia", role: "manager" },
  // clientId 6 = "Sam Rivera" in demo-data/clients.ts, the owner this demo
  // persona represents (owns the animal with ownerId 6: Copper). Staff can
  // only schedule appointments for their own boarded animal, not the farm's.
  staff: { name: "Sam", role: "staff", clientId: 6 },
  // clientId 3 = "Ava Brooks" in demo-data/clients.ts, the owner this demo
  // persona represents (owns animals with ownerId 3: Juniper and Maple).
  client: { name: "Ava", role: "client", clientId: 3 },
};
