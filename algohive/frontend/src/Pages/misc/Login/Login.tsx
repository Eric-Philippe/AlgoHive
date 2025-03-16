import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useRef<Toast>(null);

  const from = location.state?.from || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate(from, { replace: true });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setError(t("login.invalidEmailOrPassword"));
      toast.current?.show({
        severity: "error",
        summary: t("login.error"),
        detail: t("login.invalidCredentials"),
        life: 3000,
      });
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/src/assets/login.png')" }}
    >
      <Toast ref={toast} />

      <div className="flex flex-col md:flex-row rounded-lg shadow-lg w-full md:w-3/4 overflow-hidden">
        {/* Right section (login) - top on mobile */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center rounded-b-lg md:rounded-b-none md:rounded-r-lg border-2 border-white bg-transparent order-1 md:order-2">
          <h1 className="text-2xl font-semibold mb-4 text-center">
            {t("login.title")}
          </h1>
          {error && (
            <p className="text-red-500 text-sm text-center mb-2">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                {t("login.email")}
              </label>
              <InputText
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-inputtext"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                {t("login.password")}
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                feedback={false}
                toggleMask
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember">{t("login.remember")}</label>
              </div>
              <a href="#" className="text-blue-500">
                {t("login.forgot")}
              </a>
            </div>
            <Button
              type="submit"
              label={t("login.submit")}
              className="w-full p-button-primary"
            />
          </form>
          <Divider className="my-4" />
          <p className="text-center text-sm mt-4">
            {t("login.noAccount")}{" "}
            <a href="#" className="text-blue-500">
              {t("login.askAdmin")}
            </a>
          </p>
        </div>

        {/* Left section (features) - bottom on mobile */}
        <div
          className="w-full md:w-1/2 p-6 md:p-10 text-black flex flex-col justify-center order-2 md:order-1"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t("login.welcome")}{" "}
            <span className="text-amber-400">{t("app.name")}</span>
          </h2>
          <p className="mb-6">{t("login.tagline")}</p>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-xl mr-2">🐝</span>
              <div>
                <h3 className="font-semibold">{t("login.feature1.title")}</h3>
                <p className="text-sm">{t("login.feature1.desc")}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-2">🧩</span>
              <div>
                <h3 className="font-semibold">{t("login.feature2.title")}</h3>
                <p className="text-sm">{t("login.feature2.desc")}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-2">🏆</span>
              <div>
                <h3 className="font-semibold">{t("login.feature3.title")}</h3>
                <p className="text-sm">{t("login.feature3.desc")}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-2">🌐</span>
              <div>
                <h3 className="font-semibold">{t("login.feature4.title")}</h3>
                <span className="text-sm">
                  {t("login.feature4.desc")} <LanguageSwitcher />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
