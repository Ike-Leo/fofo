/* eslint-disable */
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

type Organization = {
    _id: Id<"organizations">;
    name: string;
    slug: string;
    plan: "free" | "pro" | "enterprise";
    role: "admin" | "manager" | "staff";
};

type OrganizationContextType = {
    currentOrg: Organization | null;
    setCurrentOrg: (org: Organization) => void;
    userOrgs: Organization[] | undefined;
    isLoading: boolean;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const userOrgs = useQuery((api as any).organizationMembers?.myOrganizations);
    const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("uccp_current_org_id");
        if (saved) setCurrentOrgId(saved);
    }, []);

    // Auto-select first org if none selected or current is invalid
    useEffect(() => {
        if (userOrgs && userOrgs.length > 0) {
            if (!currentOrgId || !userOrgs.find((o: any) => o._id === currentOrgId)) {
                const first = userOrgs[0];
                setCurrentOrgId(first._id);
                localStorage.setItem("uccp_current_org_id", first._id);
            }
        }
    }, [userOrgs, currentOrgId]);

    const currentOrg = userOrgs?.find((o: any) => o._id === currentOrgId) ?? null;

    const handleSetCurrentOrg = (org: Organization) => {
        setCurrentOrgId(org._id);
        localStorage.setItem("uccp_current_org_id", org._id);
    };

    return (
        <OrganizationContext.Provider
            value={{
                currentOrg: currentOrg as Organization | null, // Type assertion for schema mismatch if any
                setCurrentOrg: handleSetCurrentOrg,
                userOrgs: userOrgs as Organization[] | undefined,
                isLoading: userOrgs === undefined,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error("useOrganization must be used within an OrganizationProvider");
    }
    return context;
}
