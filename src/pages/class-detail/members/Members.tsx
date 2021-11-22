import { useEffect, useState } from "react";
import Container from "../../../components/layouts/container/Container";
import UserTable from "../../../components/UI/table/user-table/UserTable";
import MemberDetail from "./members-detail/MemberDetail";

interface memberInfo {
  id: number;
  fullName: string;
  avatar?: string;
}

const Members = () => {
  const [listTeachers, setListTeachers] = useState<memberInfo[]>([]);
  const [listStudents, setListStudents] = useState<memberInfo[]>([]);
  const [isShowListTeacher, setIsShowListTeacher] = useState<boolean>(true);
  const [memberIdDetail, setMemberIdDetail] = useState<number>(0);

  const pathname = window.location.pathname;

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/classes/" +
            pathname.split("/")[2] +
            "/members"
        );
        const result = await res.json();

        if (res.status !== 200) {
          throw new Error(result.message);
        } else {
          setListStudents(result.data.students);
          setListTeachers(result.data.teachers);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchApi();
  }, [pathname]);

  const chooseMember = (id: number) => {
    setMemberIdDetail(id);
  };

  return (
    <Container>
      <div className="members">
        <div className="members__content">
          <h1 className="members__title">Thành viên</h1>
          <div className="members__table">
            <ul className="members__menu">
              <li
                className={
                  "members__menu-item" + (isShowListTeacher ? " active" : "")
                }
                onClick={() => setIsShowListTeacher(true)}
              >
                Giảng viên
              </li>
              <li
                className={
                  "members__menu-item" + (!isShowListTeacher ? " active" : "")
                }
                onClick={() => setIsShowListTeacher(false)}
              >
                Học viên
              </li>
            </ul>
            <div className="members__list">
              {isShowListTeacher ? (
                <UserTable
                  listUsers={listTeachers}
                  onChooseMember={chooseMember}
                  memberIdChoose={memberIdDetail}
                />
              ) : (
                <UserTable
                  listUsers={listStudents}
                  onChooseMember={chooseMember}
                  memberIdChoose={memberIdDetail}
                />
              )}
            </div>
          </div>
        </div>
        <div className="members__detail">
          <MemberDetail memberId={memberIdDetail} />
        </div>
      </div>
    </Container>
  );
};

export default Members;
