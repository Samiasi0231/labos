import { createContext, useState, type ReactNode } from "react";

export type LabRole = "lab_owner" | "receptionist" | "scientist";

export interface RoleProfile {
  name: string;
  title: string;
  initials: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ROLE_PROFILES: Record<LabRole, RoleProfile> = {
  lab_owner:    { name: "Dr. Nnenna Okafor", title: "Lab Manager",    initials: "NO" },
  receptionist: { name: "Kemi Adewale",       title: "Receptionist",   initials: "KA" },
  scientist:    { name: "Dr. Chidi Nwosu",    title: "Lab Scientist",  initials: "CN" },
};

interface RoleContextType {
  role: LabRole;
  setRole: (r: LabRole) => void;
  profile: RoleProfile;
}

// eslint-disable-next-line react-refresh/only-export-components
export const RoleContext = createContext<RoleContextType>({
  role: "lab_owner",
  setRole: () => {},
  profile: ROLE_PROFILES.lab_owner,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<LabRole>(() => {
    return (localStorage.getItem("labos_role") as LabRole) ?? "lab_owner";
  });

  const setRole = (r: LabRole) => {
    setRoleState(r);
    localStorage.setItem("labos_role", r);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, profile: ROLE_PROFILES[role] }}>
      {children}
    </RoleContext.Provider>
  );
}
