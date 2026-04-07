
export interface Badge {
  id: string;
  name: string;
  image: string;
  description: string;
}

export const BADGES: Badge[] = [
  {
    id: "early-supporter",
    name: "Early Supporter",
    image: "/assets/badges/early-supporter.png",
    description: "One of the first 100 members of the community."
  },
  {
    id: "admin",
    name: "Admin",
    image: "/assets/badges/admin.png",
    description: "Community Administrator."
  },
  {
    id: "bug-hunter",
    name: "Bug Hunter",
    image: "/assets/badges/bug-hunter.png",
    description: "Found and reported a bug."
  },
  {
    id: "premium-pro",
    name: "PRO Plan",
    image: "/assets/badges/badge-pro.png",
    description: "PRO Plan Subscriber"
  },
  {
    id: "premium-team",
    name: "TEAM Plan",
    image: "/assets/badges/badge-ultra.png",
    description: "TEAM Plan Subscriber (Up to 5 users)"
  },
  {
    id: "premium-max",
    name: "MAX Plan",
    image: "/assets/badges/badge-max.png",
    description: "MAX Plan Subscriber"
  }
];
