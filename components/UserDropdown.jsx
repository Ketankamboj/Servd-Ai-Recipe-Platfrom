"use client";

import { UserButton } from "@clerk/nextjs";
import { Refrigerator, Cookie, Settings } from "lucide-react";
import React from "react";

const UserDropdown = () => {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="My Recipes"
          labelIcon={<Cookie size={16} />}
          href="/recipes"
        />
        <UserButton.Link
          label="My Pantry"
          labelIcon={<Refrigerator size={16} />}
          href="/pantry"
        />
        <UserButton.Link
          label="Settings"
          labelIcon={<Settings size={16} />}
          href="/settings"
        />
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default UserDropdown;
