export interface MaintenanceTask {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  assignedTo: string;
  notes: string;
  repairCost: number | null;
  completedAt?: string;   // only for completed tasks
  horseId?: number;
}



export const maintenanceTasks: MaintenanceTask[] = [
  {
    id: "1",
    title: "Fix fence",
    status: "Pending",
    notes: "",
    dueDate: "",
    assignedTo: "",
    repairCost: null
  },
  {
    id: "2",
    title: "Clean barn",
    status: "In Progress",
    notes: "",
    dueDate: "",
    assignedTo: "",
    repairCost: null
  }
];



