"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { ProfileForm } from "../settings/ProfileForm";
import { useActiveSidebarTab } from "@/lib/context";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const ProfileDrawer = () => {
    const [activeTab, setActiveTab] = useActiveSidebarTab();

    return (
        <Sheet
            open={activeTab?.tab === "edit-profile"}
            onOpenChange={() => setActiveTab({ id: null, tab: "gallery" })}
        >
            <SheetContent
                className="dark:bg-neutral-900 overflow-y-auto p-0 dark:border-dark-border sm:max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <VisuallyHidden.Root>
                    <SheetHeader>
                        <SheetTitle>Edit Profile</SheetTitle>
                        <SheetDescription>Update your profile details</SheetDescription>
                    </SheetHeader>
                </VisuallyHidden.Root>
                <ProfileForm className="max-w-xl mx-auto p-6" />
            </SheetContent>
        </Sheet>
    );
};

export default ProfileDrawer;
