"use client";

import React, { useEffect, useState } from "react";
import { mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "../../../_components/Icon";
import Link from "next/link";
import { getButtonColor } from "../../../_lib/colors";
import AsideMenuList from "./List";
import { MenuAsideItem } from "../../../_interfaces";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";

type Props = {
  item: MenuAsideItem;
  onRouteChange: () => void;
  isDropdownList?: boolean;
};

const AsideMenuItem = ({ item, isDropdownList = false, ...props }: Props) => {
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const user = useUser();
  const router = useRouter();

  const activeClassAddon =
    !item.color && isLinkActive ? "aside-menu-item-active font-bold" : "";

  const pathname = usePathname();

  useEffect(() => {
    setIsLinkActive(item.href === pathname);
  }, [item.href, pathname]);

  const handleLogout = async () => {
    try {
      if (user) {
        await user.signOut();
      }
      
      // Reindirizza alla pagina di login
      router.push('/login');
      props.onRouteChange();
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const handleClick = () => {
    if (item.isLogout) {
      handleLogout();
    } else if (!item.href) {
      setIsDropdownActive(!isDropdownActive);
    } else {
      props.onRouteChange();
    }
  };

  const asideMenuItemInnerContents = (
    <>
      {item.icon && (
        <Icon
          path={item.icon}
          className={`flex-none ${activeClassAddon}`}
          w="w-16"
          size="18"
        />
      )}
      <span
        className={`grow text-ellipsis line-clamp-1 ${
          item.menu ? "" : "pr-12"
        } ${activeClassAddon}`}
      >
        {item.label}
      </span>
      {item.menu && (
        <Icon
          path={isDropdownActive ? mdiMinus : mdiPlus}
          className={`flex-none ${activeClassAddon}`}
          w="w-12"
        />
      )}
    </>
  );

  const componentClass = [
    "flex cursor-pointer",
    isDropdownList ? "py-3 px-6 text-sm" : "py-3",
    item.color
      ? getButtonColor(item.color, false, true)
      : `aside-menu-item dark:text-slate-300 dark:hover:text-white`,
  ].join(" ");

  return (
    <li>
      {item.href && !item.isLogout && (
        <Link
          href={item.href}
          target={item.target}
          className={componentClass}
          onClick={props.onRouteChange}
        >
          {asideMenuItemInnerContents}
        </Link>
      )}
      {(!item.href || item.isLogout) && (
        <div
          className={componentClass}
          onClick={handleClick}
        >
          {asideMenuItemInnerContents}
        </div>
      )}
      {item.menu && (
        <AsideMenuList
          menu={item.menu}
          className={`aside-menu-dropdown ${
            isDropdownActive ? "block dark:bg-slate-800/50" : "hidden"
          }`}
          onRouteChange={props.onRouteChange}
          isDropdownList
        />
      )}
    </li>
  );
};

export default AsideMenuItem;
