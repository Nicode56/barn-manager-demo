
// ---------------------------------------------
//  Unique ID Generators
// ---------------------------------------------

// Farm ID (UUID)
export const farmId = crypto.randomUUID();

// Owner ID (small sequential number)
export function generateOwnerId(existingIds: number[]): number {
  return existingIds.length > 0
    ? Math.max(...existingIds) + 1
    : 1;
}

// Animal ID (unique 6-digit number)
export function generateAnimalId(existingIds: number[]): number {
  let id;
  do {
    id = Math.floor(100000 + Math.random() * 900000);
  } while (existingIds.includes(id));
  return id;
}



// ---------------------------------------------
//  Animal Types
// ---------------------------------------------

export interface AnimalFeed {
  level: number;
  low: boolean;
  type: string;
  brand: string;
}

export interface Supplement {
  name: string;
  level: number;
  low: boolean;
  type?: string;
  brand?: string;
}

export interface AnimalAlerts {
  knownIssues: string;
  contactUnless: string;
}

export interface AnimalHealth {
  vet: string;
  farrier: string;
  dentist: string;
  vaccinations: string;
  // Set once a manager confirms a completed appointment for this provider.
  lastVet?: string;
  lastFarrier?: string;
  lastDentist?: string;
  lastChiropractor?: string;
}

export interface Animal {
  id: number;          // 6-digit numeric ID
  farmId: string;
  barnId: string;      // UUID
  ownerId: number;     // numeric owner ID
  name: string;
  breed: string;
  age: number;
  image: string;
  description: string;
  pasture: string;
  stall: string;
  status: string;
  notes: string;
  temperament: string;
  precautions: string;
  health: AnimalHealth;
  feed: AnimalFeed;
  supplements: Supplement[];
  alerts: AnimalAlerts;
}


// ---------------------------------------------
//  Build Animals Array Safely
// ---------------------------------------------

export const animals: Animal[] = [];

function addAnimal(data: Omit<Animal, "id" | "farmId" | "barnId">) {
  const existingIds = animals.map(a => a.id);

  animals.push({
    id: generateAnimalId(existingIds),
    farmId,
    barnId:'',
    ...data
  });
}


// ---------------------------------------------
//  Add Your Animals
// ---------------------------------------------

addAnimal({
  name: "Willow",
  breed: "Palomino",
  age: 7,
  image: "/demo-horses/Horse 1.png",
  description: "Golden palomino with white mane, photographed outdoors near a barn.",
  ownerId: 1,
  pasture: "Pasture A",
  stall: "Stall 1",
  status: "Active",
  notes: "Excellent lesson horse; great with beginners.",
  temperament: "Gentle and affectionate; enjoys grooming and calm environments.",
  precautions: "Sensitive to loud noises; prefers gradual introductions to new horses.",
  health: {
    vet: "2026-08-12",
    farrier: "2026-07-01",
    dentist: "2026-11-20",
    vaccinations: "2026-09-15"
  },
  feed: {
    level: 50,
    low: false,
    type: "Sweet Feed",
    brand: "Golden Meadow"
  },
  supplements: [
    { name: "Magnesium", level: 2, low: false },
    { name: "Electrolytes", level: 1, low: false }
  ],
  alerts: {
    knownIssues: "None",
    contactUnless: "Lameness or any sudden change in behavior"
  }
});

addAnimal({
    name: "Aspen",
    breed: "Bay",
    age: 6,
    image: "/demo-horses/horse 2.png",
    description: "Rich bay coat with black mane and white star, standing by a rustic barn.",
    ownerId: 2,
    pasture: "Pasture B",
    stall: "Stall 2",
    status: "Active",
    notes: "Reliable trail horse; steady in new environments.",
    temperament: "Confident and steady; ideal for trail rides and beginners.",
    precautions: "Monitor for mild seasonal allergies; keep turnout time balanced.",
    health: {
      vet: "2026-07-22",
      farrier: "2026-06-30",
      dentist: "2026-10-10",
      vaccinations: "2026-09-01"
    },
    feed: {
  level: 50,        // current feed amount in lbs
  low: false,
  type: "Sweet Feed",
  brand: "Golden Meadow"        // staff can mark true, manager can clear
},

supplements: [
  {
    name: "Magnesium",
    level: 2,       // number of containers remaining
    low: false      // staff can mark true, manager can clear
  },
  {
    name: "Electrolytes",
    level: 1,
    low: false
  }
],

    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }

  });
  
addAnimal({
    name: "Juniper",
    breed: "Chestnut",
    age: 5,
    image: "/demo-horses/horse 3.png",
    description: "Chestnut horse with a white blaze and green halter, captured in warm daylight.",
    ownerId: 3,
    pasture: "Pasture C",
    stall: "Stall 3",
    status: "In Training",
    notes: "Working on ground manners; responds well to consistent routines.",
    temperament: "Playful and curious; enjoys attention and light work.",
    precautions: "Can nip when bored; ensure enrichment toys or regular exercise.",
    health: {
      vet: "2026-08-05",
      farrier: "2026-07-03",
      dentist: "2026-12-01",
      vaccinations: "2026-09-18"
    },
    feed: {
  level: 50,        // current feed amount in lbs
  low: false,
  type: "Sweet Feed",
  brand: "Golden Meadow"        // staff can mark true, manager can clear
},

supplements: [
  {
    name: "Magnesium",
    level: 2,       // number of containers remaining
    low: false      // staff can mark true, manager can clear
  },
  {
    name: "Electrolytes",
    level: 1,
    low: false
  }
],

    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }

  });
   
  addAnimal({
    name: "Sterling",
    breed: "Gray",
    age: 8,
    image: "/demo-horses/horse 4.png",
    description: "Gray horse with dark mane and brown leather halter, near a weathered barn.",
    ownerId: 1,
    pasture: "Pasture D",
    stall: "Stall 4",
    status: "On Rest",
    notes: "Mild tendon strain; limited turnout recommended.",
    temperament: "Calm and observant; reliable under saddle.",
    precautions: "Prone to mild skin sensitivity; use gentle grooming products.",
    health: {
      vet: "2026-07-30",
      farrier: "2026-07-12",
      dentist: "2026-11-05",
      vaccinations: "2026-09-10"
    },
    feed: {
  level: 50,        // current feed amount in lbs
  low: false,
  type: "Sweet Feed",
  brand: "Golden Meadow"        // staff can mark true, manager can clear
},

supplements: [
  {
    name: "Magnesium",
    level: 2,       // number of containers remaining
    low: false      // staff can mark true, manager can clear
  },
  {
    name: "Electrolytes",
    level: 1,
    low: false
  }
],

    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }

  });
  
    addAnimal({
    name: "Luna",
    breed: "Palomino",
    age: 9,
    image: "/demo-horses/horse 5.png",
    description: "Golden palomino with flowing white mane and brass halter, barn-side portrait.",
    ownerId: 4,
    pasture: "Pasture A",
    stall: "Stall 5",
    status: "Active",
    notes: "Great with kids; calm during grooming.",
    temperament: "Sweet-natured and patient; bonds easily with handlers.",
    precautions: "Requires UV protection for light skin around muzzle during summer.",
    health: {
      vet: "2026-08-18",
      farrier: "2026-07-08",
      dentist: "2026-10-28",
      vaccinations: "2026-09-22"
    },
    feed: {
  level: 50,        // current feed amount in lbs
  low: false,
  type: "Sweet Feed",
  brand: "Golden Meadow"        // staff can mark true, manager can clear
},

supplements: [
  {
    name: "Magnesium",
    level: 2,       // number of containers remaining
    low: false      // staff can mark true, manager can clear
  },
  {
    name: "Electrolytes",
    level: 1,
    low: false
  }
],

    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }

  });
  
    addAnimal({
    name: "Ranger",
    breed: "Bay",
    age: 6,
    image: "/demo-horses/horse 6.png",
    description: "Bay horse with black mane and white star, wearing a black halter.",
    ownerId: 5,
    pasture: "Pasture B",
    stall: "Stall 6",
    status: "Active",
    notes: "High energy; best for intermediate riders.",
    temperament: "Alert and responsive; enjoys structured training sessions.",
    precautions: "Can become anxious in confined spaces; prefers open stalls.",
    health: {
      vet: "2026-07-25",
      farrier: "2026-07-02",
      dentist: "2026-11-15",
      vaccinations: "2026-09-05"
    },
    feed: {
  level: 50,        // current feed amount in lbs
  low: false,
  type: "Sweet Feed",
  brand: "Golden Meadow"        // staff can mark true, manager can clear
},

supplements: [
  {
    name: "Magnesium",
    level: 2,       // number of containers remaining
    low: false      // staff can mark true, manager can clear
  },
  {
    name: "Electrolytes",
    level: 1,
    low: false
  }
],

    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }

  });
  addAnimal({
    name: "Maple",
    breed: "Chestnut",
    age: 5,
    image: "/demo-horses/horse 7.png",
    description: "Chestnut horse with white blaze and green halter, photographed near a barn.",
    ownerId: 3,
    pasture: "Pasture C",
    stall: "Stall 7",
    status: "In Training",
    notes: "Working on canter transitions; improving steadily.",
    temperament: "Energetic and social; thrives in group turnout.",
    precautions: "Monitor feed intake; tends to gain weight easily.",
    health: {
      vet: "2026-08-02",
      farrier: "2026-07-10",
      dentist: "2026-12-05",
      vaccinations: "2026-09-12"
    },
    feed: {
  level: 50,        // current feed amount in lbs
  low: false,
  type: "Sweet Feed",
  brand: "Golden Meadow"        // staff can mark true, manager can clear
},

supplements: [
  {
    name: "Magnesium",
    level: 2,       // number of containers remaining
    low: false      // staff can mark true, manager can clear
  },
  {
    name: "Electrolytes",
    level: 1,
    low: false
  }
],

    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }

  });
  addAnimal({
    name: "Ash",
    breed: "Gray",
    age: 8,
    image: "/demo-horses/horse 8.png",
    description: "Gray horse with dark mane and brown halter, soft pink muzzle, barn background.",
    ownerId: 2,
    pasture: "Pasture D",
    stall: "Stall 8",
    status: "On Rest",
    notes: "Mild arthritis; prefers soft footing.",
    temperament: "Gentle and steady; excellent for lessons and beginners.",
    precautions: "Sensitive to cold weather; ensure proper blanketing in winter.",
    health: {
      vet: "2026-07-28",
      farrier: "2026-07-06",
      dentist: "2026-11-30",
      vaccinations: "2026-09-08"
    },
    feed: {
  level: 50,        // current feed amount in lbs
  low: false,
  type: "Sweet Feed",
  brand: "Golden Meadow"        // staff can mark true, manager can clear
},

supplements: [
  {
    name: "Magnesium",
    level: 2,       // number of containers remaining
    low: false      // staff can mark true, manager can clear
  },
  {
    name: "Electrolytes",
    level: 1,
    low: false
  }
],
 
    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }

  });
  addAnimal({
    name: "Dakota",
    breed: "Pinto",
    age: 7,
    image: "/demo-horses/horse 9.png",
    description: "White and brown pinto with pink muzzle and brass halter, natural barn lighting.",
    ownerId: 4,
    pasture: "Pasture A",
    stall: "Stall 2",
    status: "Active",
    notes: "Enjoys obstacle courses; very curious.",
    temperament: "Curious and intelligent; enjoys groundwork and obstacle courses.",
    precautions: "Can be head-shy; approach calmly when haltering.",
    health: {
      vet: "2026-08-10",
      farrier: "2026-07-04",
      dentist: "2026-10-22",
      vaccinations: "2026-09-20"
    },
    feed: {
  level: 50,        // current feed amount in lbs
  low: false,
  type: "Sweet Feed",
  brand: "Golden Meadow"        // staff can mark true, manager can clear
},

supplements: [
  {
    name: "Magnesium",
    level: 2,       // number of containers remaining
    low: false      // staff can mark true, manager can clear
  },
  {
    name: "Electrolytes",
    level: 1,
    low: false
  }
],

    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }

  });
  addAnimal({
    name: "Shadow",
    breed: "Pinto",
    age: 6,
    image: "/demo-horses/horse 10.png",
    description: "Black and white pinto with teal halter and split mane, barn-side portrait.",
    ownerId: 5,
    pasture: "Pasture B",
    stall: "Stall 3",
    status: "Active",
    notes: "Strong personality; loves outdoor work.",
    temperament: "Bold and spirited; loves attention and outdoor work.",
    precautions: "Needs consistent handling; can test boundaries with new riders.",
    health: {
      vet: "2026-07-18",
      farrier: "2026-07-09",
      dentist: "2026-11-12",
      vaccinations: "2026-09-03"
    },
    feed: {
  level: 50,        // current feed amount in lbs
  low: false,
  type: "Sweet Feed",
  brand: "Golden Meadow"        // staff can mark true, manager can clear
},

supplements: [
  {
    name: "Magnesium",
    level: 2,       // number of containers remaining
    low: false      // staff can mark true, manager can clear
  },
  {
    name: "Electrolytes",
    level: 1,
    low: false
  }
],

    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }

  });

  addAnimal({
    name: "Copper",
    breed: "Sorrel",
    age: 10,
    image: "/demo-horses/Horse 1.png",
    description: "Sorrel horse with a flaxen mane, boarded by a staff member.",
    ownerId: 6,
    pasture: "Pasture C",
    stall: "Stall 9",
    status: "Active",
    notes: "Staff member's personal horse, boarded on-site.",
    temperament: "Easygoing and low-maintenance.",
    precautions: "None known.",
    health: {
      vet: "2026-08-20",
      farrier: "2026-07-15",
      dentist: "2026-11-25",
      vaccinations: "2026-09-25"
    },
    feed: {
      level: 50,
      low: false,
      type: "Sweet Feed",
      brand: "Golden Meadow"
    },
    supplements: [
      { name: "Magnesium", level: 2, low: false },
      { name: "Electrolytes", level: 1, low: false }
    ],
    alerts: {
      knownIssues: "None",
      contactUnless: "Lameness or any sudden change in behavior"
    }
  });

