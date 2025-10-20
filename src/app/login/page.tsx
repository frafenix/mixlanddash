"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthWrapper from "@/components/AuthWrapper";
import SectionMain from "../_components/Section/Main";
import CardBox from "../_components/CardBox";
import CardBoxComponentBody from "../_components/CardBox/Component/Body";
import Icon from "../_components/Icon";
import { mdiLoading } from "@mdi/js";

function LoginPageContent() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return; // wait until user loads

    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/handler/sign-in");
    }
  }, [user, router]);

  return (
    <SectionMain>
      <CardBox className="max-w-md mx-auto mt-16">
        <CardBoxComponentBody>
          <div className="text-center">
            <Icon path={mdiLoading} size="48" className="animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Reindirizzamento in corso...</p>
          </div>
        </CardBoxComponentBody>
      </CardBox>
    </SectionMain>
  );
}

export default function LoginPage() {
  return (
    <AuthWrapper>
      <LoginPageContent />
    </AuthWrapper>
  );
}