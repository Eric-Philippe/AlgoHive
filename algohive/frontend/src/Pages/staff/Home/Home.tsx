import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import "./Home.css";

// PrimeReact Components
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { Badge } from "primereact/badge";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import {
  changePassword,
  updateUserProfile,
} from "../../../services/usersService";
import { useActivePage } from "../../../contexts/ActivePageContext";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

export default function HomePage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const { setActivePage } = useActivePage();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [activeRoles, setActiveRoles] = useState<number>(0);

  // New state variables for profile update
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setActiveRoles(user.roles.length);
      setFirstName(user.firstname);
      setLastName(user.lastname);
      setEmail(user.email);
    }
  }, [newPassword, user]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.current?.show({
        severity: "error",
        summary: t("staffTabs.home.messages.error"),
        detail: t("staffTabs.home.messages.passwordMismatch"),
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.current?.show({
        severity: "error",
        summary: t("staffTabs.home.messages.error"),
        detail: t("staffTabs.home.messages.passwordTooShort"),
      });
      return;
    }

    try {
      setIsChangingPass(true);
      await changePassword(oldPassword, newPassword);

      toast.current?.show({
        severity: "success",
        summary: t("staffTabs.home.messages.success"),
        detail: t("staffTabs.home.messages.passwordResetSuccess"),
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: t("staffTabs.home.messages.error"),
        detail: t("staffTabs.home.messages.passwordResetError"),
      });
      console.error(error);
    } finally {
      setIsChangingPass(false);
    }
  };

  const confirmLogout = () => {
    confirmDialog({
      message: t("staffTabs.home.messages.confirmLogout"),
      header: t("staffTabs.home.logoutHeader"),
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        logout();
        navigate("/login");
      },
    });
  };

  const passwordHeader = (
    <div className="flex flex-wrap align-items-center gap-2">
      <span className="font-bold">{t("staffTabs.home.passwordStrength")}</span>
    </div>
  );

  const passwordFooter = (
    <>
      <Divider />
      <p className="mt-2">Suggestions</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3">
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </>
  );

  const formatLastConnected = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch (e) {
      console.error("Error parsing date:", e);
      return t("staffTabs.home.neverConnected");
    }
  };

  // New function to handle profile update
  const handleUpdateProfile = async () => {
    // Validation
    if (!firstName.trim()) {
      toast.current?.show({
        severity: "error",
        summary: t("staffTabs.home.messages.error"),
        detail: t("staffTabs.users.messages.firstNameRequired"),
      });
      return;
    }

    if (!lastName.trim()) {
      toast.current?.show({
        severity: "error",
        summary: t("staffTabs.home.messages.error"),
        detail: t("staffTabs.users.messages.lastNameRequired"),
      });
      return;
    }

    try {
      setIsUpdating(true);
      await updateUserProfile(firstName, lastName, email);

      // Show success message
      toast.current?.show({
        severity: "success",
        summary: t("staffTabs.home.messages.success"),
        detail: t("staffTabs.home.messages.profileUpdateSuccess"),
      });

      // Optionally, refresh user data
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: t("staffTabs.home.messages.error"),
        detail: t("staffTabs.home.messages.profileUpdateError"),
      });
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 min-h-screen mb-28">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Welcome Section */}
      <div className="mb-6 bg-gradient-to-r from-amber-600 to-orange-400 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t("staffTabs.home.welcome")}, {user?.firstname} {user?.lastname}!
            </h1>
            <p className="text-blue-200">
              {t("staffTabs.home.lastLogin")}:{" "}
              {user?.last_connected
                ? formatLastConnected(user.last_connected)
                : t("staffTabs.home.neverConnected")}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <Avatar
              label={`${user?.firstname.charAt(0)}${user?.lastname.charAt(0)}`}
              size="large"
              shape="circle"
              className="bg-indigo-700 text-white font-bold"
            />
            <Button
              label={t("staffTabs.home.logout")}
              icon="pi pi-sign-out"
              onClick={confirmLogout}
              className="p-button-text p-button-danger"
              style={{ backgroundColor: "rgba(255, 255, 255, 1)" }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <Card
          className="lg:col-span-2 shadow-lg"
          title={t("staffTabs.home.profileInfo")}
        >
          <TabView>
            <TabPanel header={t("common.fields.roles")}>
              <div className="mt-4 flex flex-wrap gap-2">
                {user?.roles.length ? (
                  user.roles.map((role) => (
                    <Chip
                      key={role.id}
                      label={role.name}
                      icon="pi pi-user-edit"
                      className="bg-indigo-100 text-indigo-800"
                    />
                  ))
                ) : (
                  <p className="text-gray-500">
                    {t("staffTabs.roles.noRoles")}
                  </p>
                )}
              </div>
            </TabPanel>
          </TabView>

          <Divider />

          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-3">
              {t("staffTabs.home.accountInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <i className="pi pi-envelope mr-2 text-blue-700"></i>
                <span className="font-medium mr-2">
                  {t("common.fields.email")}:
                </span>
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center">
                <i className="pi pi-id-card mr-2 text-blue-700"></i>
                <span className="font-medium mr-2">ID:</span>
                <span className="text-gray-600">{user?.id}</span>
              </div>
              <div className="flex items-center">
                <i className="pi pi-shield mr-2 text-blue-700"></i>
                <span className="font-medium mr-2">
                  {t("staffTabs.home.status")}:
                </span>
                <span
                  className={user?.blocked ? "text-red-500" : "text-green-500"}
                >
                  {user?.blocked
                    ? t("staffTabs.users.blocked")
                    : t("staffTabs.users.active")}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Password Reset Section */}
        <Card title={t("staffTabs.home.resetPassword")} className="shadow-lg">
          <div className="mb-4">
            <label
              htmlFor="old-password"
              className="block text-sm font-medium mb-1"
            >
              {t("staffTabs.home.oldPassword")}
            </label>
            <Password
              id="old-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full"
              feedback={false}
              toggleMask
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="new-password"
              className="block text-sm font-medium mb-1"
            >
              {t("staffTabs.home.newPassword")}
            </label>
            <Password
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              toggleMask
              className="w-full"
              header={passwordHeader}
              footer={passwordFooter}
              promptLabel={t("staffTabs.home.enterPassword")}
              weakLabel={t("staffTabs.home.weak")}
              mediumLabel={t("staffTabs.home.medium")}
              strongLabel={t("staffTabs.home.strong")}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium mb-1"
            >
              {t("staffTabs.home.confirmPassword")}
            </label>
            <Password
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              toggleMask
              feedback={false}
              className={`w-full ${
                confirmPassword && newPassword !== confirmPassword
                  ? "p-invalid"
                  : ""
              }`}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <small className="p-error">
                {t("staffTabs.home.messages.passwordMismatch")}
              </small>
            )}
          </div>

          <Button
            label={t("staffTabs.home.updatePassword")}
            icon="pi pi-lock"
            loading={isChangingPass}
            disabled={
              !newPassword ||
              !confirmPassword ||
              !oldPassword ||
              newPassword !== confirmPassword
            }
            onClick={handlePasswordChange}
            className="w-full mt-2"
          />
        </Card>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xl font-semibold">
              {t("staffTabs.home.activeRoles")}
            </div>
            <Badge value={activeRoles} severity="info" />
          </div>
          <p className="text-gray-500">
            {t("staffTabs.home.rolesDescription")}
          </p>
        </Card>

        <Card className="shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xl font-semibold">
              {t("staffTabs.home.quickActions")}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Button
              label={t("navigation.staff.users")}
              icon="pi pi-users"
              className="p-button-sm p-button-outlined"
              onClick={() => setActivePage("users")}
            />
            <Button
              label={t("navigation.staff.competitions")}
              icon="pi pi-flag"
              className="p-button-sm p-button-outlined"
              onClick={() => setActivePage("groups")}
            />
            <Button
              label={t("navigation.staff.catalogs")}
              icon="pi pi-book"
              className="p-button-sm p-button-outlined"
              onClick={() => setActivePage("competitions")}
            />

            <div className="">
              <label className="block text-sm font-medium mb-1">
                {t("staffTabs.home.language")}
              </label>
              <Button>
                <LanguageSwitcher />
              </Button>
            </div>
          </div>
        </Card>

        {/* Replace Last Activity with Update Profile panel */}
        <Card className="shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xl font-semibold">
              {t("staffTabs.home.updateProfile")}
            </div>
            <Badge value="Edit" severity="info" />
          </div>

          <div className="mb-3">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium mb-1"
            >
              {t("common.fields.firstName")}
            </label>
            <InputText
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full"
              placeholder={t("common.fields.firstName")}
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium mb-1"
            >
              {t("common.fields.lastName")}
            </label>
            <InputText
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full"
              placeholder={t("common.fields.lastName")}
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium mb-1"
            >
              {t("common.fields.email")}
            </label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              placeholder={t("common.fields.email")}
            />
          </div>

          <Button
            label={t("staffTabs.home.saveChanges")}
            icon="pi pi-user-edit"
            loading={isUpdating}
            onClick={handleUpdateProfile}
            className="w-full"
          />
        </Card>
      </div>
    </div>
  );
}
