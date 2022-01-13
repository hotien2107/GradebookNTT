import { useAuth } from "../../../../contexts/auth-context";
import Item from "./item/Item";

const Menu = () => {
  const authCtx = useAuth();

  const pathname = window.location.pathname;

  const isClassDetail = pathname.indexOf("class-detail") >= 0;

  if (!authCtx.isLoggedIn) {
    return (
      <ul className="menu">
        <Item content="Trang chủ" link="home" />
        <Item content="Về chúng tôi" link="about-us" />
      </ul>
    );
  } else {
    return !isClassDetail ? (
      <ul className="menu">
        <Item content="Danh sách lớp" link="listClasses" />
        <Item content="Tham gia lớp" link="enrollClass" />
      </ul>
    ) : (
      <ul className="menu">
        <Item content="Dòng thời gian" link={"class-detail/" + pathname.split("/")[2] + "/timeline"} />
        <Item content="Hoạt động" link={"class-detail/" + pathname.split("/")[2] + "/classwork"} />
        <Item content="Thành viên" link={"class-detail/" + pathname.split("/")[2] + "/members"} />
        <Item content="Thông tin lớp" link={"class-detail/" + pathname.split("/")[2] + "/info"} />
        <Item content="Điểm số" link={"class-detail/" + pathname.split("/")[2] + "/scores"} />
        <Item content="Phúc khảo" link={"class-detail/" + pathname.split("/")[2] + "/review"} />
      </ul>
    );
  }
};

export default Menu;
