import React from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon as HomeOutline,
  ClipboardDocumentListIcon as ClipboardOutline,
  UserGroupIcon as UserGroupOutline,
  UsersIcon as UsersOutline,
  CalendarDaysIcon as CalendarOutline,
  EnvelopeIcon as EnvelopeOutline,
  ChartBarIcon as ChartOutline,
  ShieldCheckIcon as ShieldCheckOutline,
  Cog6ToothIcon as CogOutline,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  ClipboardDocumentListIcon as ClipboardSolid,
  UserGroupIcon as UserGroupSolid,
  UsersIcon as UsersSolid,
  CalendarDaysIcon as CalendarSolid,
  EnvelopeIcon as EnvelopeSolid,
  ChartBarIcon as ChartSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  Cog6ToothIcon as CogSolid,
} from "@heroicons/react/24/solid";

const SubSideNav = () => {
  const navItems = [
    {
      name: "Overview",
      path: "/company/rostering",
      outline: HomeOutline,
      solid: HomeSolid,
      exact: true,
    },
    {
      name: "Clients",
      path: "/company/rostering/clients",
      outline: UserGroupOutline,
      solid: UserGroupSolid,
    },
    {
      name: "Employees",
      path: "/company/rostering/employees",
      outline: UsersOutline,
      solid: UsersSolid,
    },
    {
      name: "Cluster",
      path: "/company/rostering/cluster",
      outline: ClipboardOutline,
      solid: ClipboardSolid,
    },
    {
      name: "Roster",
      path: "/company/rostering/roster",
      outline: CalendarOutline,
      solid: CalendarSolid,
    },
    {
      name: "Rostering Request",
      path: "/company/rostering/rostering-requests",
      outline: EnvelopeOutline,
      solid: EnvelopeSolid,
    },
    // {
    //   name: "Logs",
    //   path: "/company/rostering/logs",
    //   outline: ChartOutline,
    //   solid: ChartSolid,
    // },
    // {
    //   name: "Audit and Compliance",
    //   path: "/company/rostering/audit-compliance",
    //   outline: ShieldCheckOutline,
    //   solid: ShieldCheckSolid,
    // },
    // {
    //   name: "Settings",
    //   path: "/company/rostering/rostering-settings",
    //   outline: CogOutline,
    //   solid: CogSolid,
    // },
  ];

  return (
    <div className="SubSideNav">
      <ul className="SubSideNav-Ul custom-scroll-bar">
        {navItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              end={item.exact}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {({ isActive }) => {
                const Icon = isActive ? item.solid : item.outline;
                return (
                  <>
                    <Icon className="icon-svg" />
                    {item.name}
                  </>
                );
              }}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubSideNav;
