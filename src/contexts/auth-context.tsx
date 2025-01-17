import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useHttp from "../hooks/useHttp";

type authctxProps = {
  children: JSX.Element;
};

interface userType {
  id: number;
  fullname: string;
  email: string;
  password: string;
  role: number;
  studentId: number | null;
  avatar: string | null;
  dob: string | null;
  address: string | null;
  numberPhone: string | null;
  facebook: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthThemeContext {
  isLoggedIn: boolean;
  isRegisterSuccess: boolean;
  onLogout: () => void;
  onLogin: (email: string, password: string) => void;
  onLoginWithGoogle: (tokenId: string) => void;
  onRegister: (email: string, password: string, fullname: string) => void;
  onChangePass: (oldPass: string, newPass: string) => void;
  message: string;
  user: userType;
  setUser: (user: userType) => void;
}

const pathname = window.location.pathname;

const AuthContext = React.createContext<AuthThemeContext>({
  isLoggedIn: false,
  isRegisterSuccess: false,
  onLogout: () => {},
  onLogin: (email: string, password: string) => {},
  onLoginWithGoogle: (tokenId: string) => {},
  onRegister: (email: string, password: string, fullname: string) => {},
  onChangePass: (oldPass: string, newPass: string) => {},
  message: "",
  user: {
    id: 0,
    fullname: "",
    email: "",
    password: "",
    role: 0,
    studentId: null,
    avatar: null,
    dob: null,
    address: null,
    numberPhone: null,
    facebook: null,
    createdAt: "",
    updatedAt: "",
  },
  setUser: (user: userType) => {},
});

const AuthContextProvider = ({ children }: authctxProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [user, setUser] = useState<userType>({
    id: 0,
    fullname: "",
    email: "",
    password: "",
    role: 0,
    studentId: null,
    avatar: null,
    dob: null,
    address: null,
    numberPhone: null,
    facebook: null,
    createdAt: "",
    updatedAt: "",
  });

  const { sendRequest } = useHttp();

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      const requestConfig = {
        url: "profile/" + userId,
      };

      const handleError = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("googleToken");
        localStorage.removeItem("userId");
        if (pathname !== "/" && pathname !== "/home" && pathname !== "/login" && pathname !== "/register") navigate("/login");
      };

      const setLogged = (data: any) => {
        setIsLoggedIn(true);
        setUser(data.profile);
      };

      sendRequest(requestConfig, handleError, setLogged);
    }
  }, [sendRequest, navigate]);

  const logoutHandler = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("googleToken");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    toast("Đăng xuất");
    navigate("/login");
  };

  const registerHandler = async (email: string, password: string, fullname: string) => {
    const data = { email: email, password: password, fullname: fullname };

    const requestConfig = {
      url: "auth/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    };

    const handleError = () => {
      toast("Đăng ký thất bại");
    };

    const registerSuccess = (data: any) => {
      setMessage(data.message);
      setIsRegisterSuccess(true);
      toast("Đăng ký thành công");
      navigate("/login");
    };

    sendRequest(requestConfig, handleError, registerSuccess);
  };

  const loginHandler = async (email: string, password: string) => {
    const data = { email: email, password: password };

    const requestConfig = {
      url: "auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    };

    const handleError = () => {
      toast("Đăng nhập thất bại");
    };

    const loginSuccess = (data: any) => {
      setIsLoggedIn(true);
      setMessage(data.message);
      setUser(data.user);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.user.id);
      toast("Đăng nhập thành công");
      navigate("/listClasses");
    };

    sendRequest(requestConfig, handleError, loginSuccess);
  };

  const loginGoogleHandler = async (tokenId: string) => {
    const data = { token: tokenId };

    const requestConfig = {
      url: "auth/google",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    };

    const handleError = () => {
      toast("Đăng nhập bằng google thất bại");
    };

    const loginGoogleSuccess = (data: any) => {
      setIsLoggedIn(true);
      setUser(data);
      localStorage.setItem("googleToken", tokenId);
      localStorage.setItem("userId", data.id);
      toast("Đăng nhập bằng google thành công");
      navigate("/listClasses");
    };

    sendRequest(requestConfig, handleError, loginGoogleSuccess);
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    const data = { oldPass: oldPass, newPass: newPass };
    const userId = user.id;

    const requestConfig = {
      url: "auth/changePwd/" + userId,
      method: "POST",
      body: data,
    };

    const handleError = () => {
      toast("Thay đổi mật khẩu thất bại");
    };

    const changePassSuccess = (data: any) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      toast("Thay đổi mật khẩu thành công");
      navigate("/login");
    };

    sendRequest(requestConfig, handleError, changePassSuccess);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isLoggedIn,
        isRegisterSuccess: isRegisterSuccess,
        onLogin: loginHandler,
        onLoginWithGoogle: loginGoogleHandler,
        onLogout: logoutHandler,
        onRegister: registerHandler,
        onChangePass: changePassword,
        message: message,
        user: user,
        setUser: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthContextProvider, useAuth };
