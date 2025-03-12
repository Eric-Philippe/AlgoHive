import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const language = event.target.value;
    i18n.changeLanguage(language);
  };

  return (
    <div className="language-switcher">
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        aria-label={t("language.select", "Select language")}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
