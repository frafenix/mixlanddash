"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React, { ReactNode } from "react";
import { mdiForwardburger, mdiBackburger, mdiMenu } from "@mdi/js";
import menuAside from "./_lib/menuAside";
import menuNavBar from "./_lib/menuNavBar";
import Icon from "../_components/Icon";
import NavBar from "./_components/NavBar";
import NavBarItemPlain from "./_components/NavBar/Item/Plain";
import AsideMenu from "./_components/AsideMenu";
import FooterBar from "./_components/FooterBar";
import FormField from "../_components/FormField";
import { Field, Form, Formik } from "formik";
import AuthWrapper from "@/components/AuthWrapper";

type Props = {
  children: ReactNode;
};

function DashboardLayoutContent({ children }: Props) {
  const user = useUser();
  const router = useRouter();
  const [isAsideMobileExpanded, setIsAsideMobileExpanded] = useState(false);
  const [isAsideLgActive, setIsAsideLgActive] = useState(false);

  useEffect(() => {
    if (user !== undefined && !user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleRouteChange = () => {
    setIsAsideMobileExpanded(false);
    setIsAsideLgActive(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  const layoutAsidePadding = "xl:pl-60";

  return (
    <div className={`overflow-hidden lg:overflow-visible`}>
      <div
        className={`${layoutAsidePadding} ${
          isAsideMobileExpanded ? "ml-60 lg:ml-0" : ""
        } pt-14 min-h-screen w-screen transition-position lg:w-auto bg-gray-50 dark:bg-slate-800 dark:text-slate-100`}
      >
        <NavBar
          menu={menuNavBar}
          className={`${layoutAsidePadding} ${isAsideMobileExpanded ? "ml-60 lg:ml-0" : ""}`}
        >
          <NavBarItemPlain
            display="flex lg:hidden"
            onClick={() => setIsAsideMobileExpanded(!isAsideMobileExpanded)}
          >
            <Icon
              path={isAsideMobileExpanded ? mdiBackburger : mdiForwardburger}
              size="24"
            />
          </NavBarItemPlain>
          <NavBarItemPlain
            display="hidden lg:flex xl:hidden"
            onClick={() => setIsAsideLgActive(true)}
          >
            <Icon path={mdiMenu} size="24" />
          </NavBarItemPlain>
          <NavBarItemPlain useMargin>
            <Formik
              initialValues={{
                search: "",
              }}
              onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
            >
              <Form>
                <FormField isBorderless isTransparent>
                  {({ className }) => (
                    <Field
                      name="search"
                      placeholder="Search"
                      className={className}
                    />
                  )}
                </FormField>
              </Form>
            </Formik>
          </NavBarItemPlain>
        </NavBar>
        <AsideMenu
          isAsideMobileExpanded={isAsideMobileExpanded}
          isAsideLgActive={isAsideLgActive}
          menu={menuAside}
          onAsideLgClose={() => setIsAsideLgActive(false)}
          onRouteChange={handleRouteChange}
        />
        {children}
        <FooterBar>
          Get more with{` `}
          <a
            href="https://tailwind-react.justboil.me/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600"
          >
            Premium version
          </a>
        </FooterBar>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: Props) {
  return (
    <AuthWrapper>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthWrapper>
  );
}
