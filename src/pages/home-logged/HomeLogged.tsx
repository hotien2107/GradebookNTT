import { useState } from "react";
import { CSSTransition } from "react-transition-group";
import { Add } from "@mui/icons-material";

import Icon from "../../components/UI/icon/Icon";
import Container from "../../components/layouts/container/Container";
import Card from "../../components/UI/card/Card";
import CreateClassForm from "../../components/UI/form/create-class/CreateClassForm";

const HomeLogged = () => {
  const [showPopup, setShowPopup] = useState<boolean>(false);

  return (
    <Container>
      <CSSTransition
        in={showPopup}
        timeout={300}
        classNames="popup"
        unmountOnExit
      >
        <CreateClassForm onClose={() => setShowPopup(false)} />
      </CSSTransition>

      <div className="homeLogged">
        <div className="homeLogged__header">
          <h1 className="homeLogged__title">Danh sách lớp học</h1>
          <div className="navbar__btn">
            <Icon>
              <Add className="icon" onClick={() => setShowPopup(true)} />
            </Icon>
          </div>
        </div>
        <div className="homeLogged__classes">
          <Card />
          <Card />
          <Card />
        </div>
      </div>
    </Container>
  );
};

export default HomeLogged;