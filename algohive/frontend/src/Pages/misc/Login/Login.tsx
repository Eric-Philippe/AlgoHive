import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <>
      <h1>{t("loginPage.title")}</h1>
    </>
  );
}
