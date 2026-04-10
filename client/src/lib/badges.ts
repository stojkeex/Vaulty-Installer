
import verifiedBadge from "@assets/IMG_1076_1775576984427.png";
import badgePro from "@assets/IMG_1148_1775815239300.png";

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
    id: "verified",
    name: "Verified",
    image: verifiedBadge,
    description: "Officially verified profile."
  },
  {
    id: "bug-hunter",
    name: "Bug Hunter",
    image: "/assets/badges/bug-hunter.png",
    description: "Found and reported a bug."
  },
  {
    id: "premium-pro",
    name: "Vaulty+",
    image: badgePro,
    description: "Vaulty+ member"
  }
];
